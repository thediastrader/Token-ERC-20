import { useMemo, useEffect } from 'react'
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { parseAbiItem, type Address } from 'viem'
import { SKILLS } from '../lib/skills'
import { CONTRACT_ADDRESS, DEPLOY_BLOCK, SKILL_QUEST_ABI } from '../lib/contract'
import { builderCode } from '../lib/builderCode'
import Spinner from '../components/Spinner'

const EVIDENCE_SUBMITTED_EVENT = parseAbiItem(
  'event EvidenceSubmitted(address indexed user, uint256 indexed skillId, string evidenceURL)',
)

type Submission = {
  user: Address
  skillId: bigint
  evidenceURL: string
}

export default function AdminPanel() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()

  // Check owner
  const { data: owner, isLoading: ownerLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILL_QUEST_ABI,
    functionName: 'owner',
  })

  const isOwner =
    address && owner && address.toLowerCase() === (owner as string).toLowerCase()

  // Fetch all EvidenceSubmitted events (last ~2 days of blocks)
  const {
    data: rawEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['evidenceEvents', publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient) return []
      const currentBlock = await publicClient.getBlockNumber()
      // Public Base Sepolia RPC caps getLogs at 10,000 blocks per request.
      // Paginate in 9,999-block chunks from the contract deployment block.
      const CHUNK = 9_999n
      const fetchChunk = (fromBlock: bigint, toBlock: bigint) =>
        publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: EVIDENCE_SUBMITTED_EVENT,
          fromBlock,
          toBlock,
        })
      type EventLog = Awaited<ReturnType<typeof fetchChunk>>[number]
      const allLogs: EventLog[] = []
      let from = DEPLOY_BLOCK
      while (from <= currentBlock) {
        const to = from + CHUNK <= currentBlock ? from + CHUNK : currentBlock
        const chunk = await fetchChunk(from, to)
        allLogs.push(...chunk)
        from = to + 1n
      }
      return allLogs
    },
    enabled: !!publicClient && !!isOwner,
    refetchInterval: 15_000,
  })

  // Deduplicate: keep the latest submission per (user, skillId)
  const uniqueSubmissions: Submission[] = useMemo(() => {
    if (!rawEvents) return []
    const map = new Map<string, Submission>()
    for (const log of rawEvents) {
      const { user, skillId, evidenceURL } = log.args as {
        user: Address
        skillId: bigint
        evidenceURL: string
      }
      map.set(`${user.toLowerCase()}-${skillId}`, { user, skillId, evidenceURL })
    }
    return Array.from(map.values()).reverse()
  }, [rawEvents])

  // Fetch current status for each unique submission
  const { data: statusData, refetch: refetchStatuses } = useReadContracts({
    contracts: uniqueSubmissions.map((s) => ({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'getSubmission' as const,
      args: [s.user, s.skillId] as const,
    })),
    query: { enabled: uniqueSubmissions.length > 0 },
  })

  // Filter to only pending (status === 1)
  const pendingSubmissions = uniqueSubmissions.filter((_, i) => {
    const result = statusData?.[i]?.result as
      | { evidenceURL: string; status: number }
      | undefined
    return result?.status === 1
  })

  const { writeContract, isPending: isTxPending, data: txHash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (txConfirmed) {
      void refetchEvents()
      void refetchStatuses()
      void queryClient.invalidateQueries({ queryKey: ['evidenceEvents'] })
    }
  }, [txConfirmed, refetchEvents, refetchStatuses, queryClient])

  const handleApprove = (user: Address, skillId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'approveAndMint',
      args: [user, skillId],
      dataSuffix: builderCode,
    })
  }

  const handleReject = (user: Address, skillId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'rejectSubmission',
      args: [user, skillId],
      dataSuffix: builderCode,
    })
  }

  // ─── Guards ──────────────────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <EmptyState
        icon="🔌"
        title="Wallet Not Connected"
        message="Connect the admin wallet to access this panel."
      />
    )
  }

  if (ownerLoading) return <Spinner />

  if (!isOwner) {
    return (
      <EmptyState
        icon="🚫"
        title="Access Denied"
        message="This panel is restricted to the contract owner."
      />
    )
  }

  const isLoading = eventsLoading

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-gold tracking-widest mb-3">
          ADMIN PANEL
        </h1>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-4" />
        <p className="font-body text-gray-500 text-sm">
          Review evidence submissions and approve or reject them.
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : pendingSubmissions.length === 0 ? (
        <div className="card-dark text-center py-16">
          <p className="text-5xl mb-4">✅</p>
          <p className="font-display text-gold tracking-widest">ALL CLEAR</p>
          <p className="font-body text-gray-500 mt-2 text-sm">
            No pending submissions at the moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-display text-xs text-gray-500 tracking-widest">
            {pendingSubmissions.length} PENDING SUBMISSION
            {pendingSubmissions.length !== 1 ? 'S' : ''}
          </p>

          {pendingSubmissions.map((sub) => {
            const skill = SKILLS.find((s) => BigInt(s.id) === sub.skillId)
            const isThisTxPending = isTxPending || isConfirming

            return (
              <div
                key={`${sub.user}-${sub.skillId}`}
                className="card-dark flex flex-col gap-4 border-amber-500/20"
              >
                {/* Skill + user */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{skill?.icon ?? '❓'}</span>
                      <span className="font-display text-gold font-semibold tracking-wide">
                        {skill?.name ?? `Skill #${sub.skillId}`}
                      </span>
                      <TierBadge tier={skill?.tier ?? 1} />
                    </div>
                    <p className="font-body text-xs text-gray-500 font-mono">
                      {formatAddress(sub.user)}
                    </p>
                  </div>
                  <span className="text-[10px] font-body font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                    ⏳ PENDING
                  </span>
                </div>

                {/* Evidence URL */}
                <div>
                  <p className="font-display text-[10px] text-gray-600 tracking-widest mb-1">
                    EVIDENCE
                  </p>
                  <a
                    href={sub.evidenceURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all transition-colors"
                  >
                    {sub.evidenceURL}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleApprove(sub.user, sub.skillId)}
                    disabled={isThisTxPending}
                    className="btn-gold text-xs px-5 py-1.5"
                  >
                    {isThisTxPending ? '…' : '✓ Approve & Mint'}
                  </button>
                  <button
                    onClick={() => handleReject(sub.user, sub.skillId)}
                    disabled={isThisTxPending}
                    className="btn-danger"
                  >
                    {isThisTxPending ? '…' : '✗ Reject'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TierBadge({ tier }: { tier: 1 | 2 | 3 }) {
  const colors: Record<number, string> = {
    1: '#3a7a4a',
    2: '#4a6aaa',
    3: '#8a5aaa',
  }
  const labels: Record<number, string> = { 1: 'T1', 2: 'T2', 3: 'T3' }
  const c = colors[tier]
  return (
    <span
      className="text-[10px] font-display font-semibold px-1.5 py-0.5 rounded"
      style={{ color: c, border: `1px solid ${c}55`, backgroundColor: `${c}20` }}
    >
      {labels[tier]}
    </span>
  )
}

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: string
  title: string
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl mb-6">{icon}</span>
      <h2 className="font-display text-xl text-gold tracking-widest mb-3">{title}</h2>
      <p className="font-body text-gray-500">{message}</p>
    </div>
  )
}
