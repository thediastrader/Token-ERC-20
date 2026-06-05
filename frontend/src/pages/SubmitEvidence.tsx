import { useState, useEffect } from 'react'
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { type BaseError } from 'viem'
import { SKILLS } from '../lib/skills'
import { CONTRACT_ADDRESS, SKILL_QUEST_ABI } from '../lib/contract'
import { builderCode } from '../lib/builderCode'
import Spinner from '../components/Spinner'

export default function SubmitEvidence() {
  const { address, isConnected } = useAccount()
  const [selectedSkillId, setSelectedSkillId] = useState<number>(1)
  const [evidenceUrl, setEvidenceUrl] = useState('')

  // Fetch statuses for all skills
  const { data: hasSkillData, isLoading: loadingHas } = useReadContracts({
    contracts: SKILLS.map((skill) => ({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'hasSkill' as const,
      args: [address!, BigInt(skill.id)] as const,
    })),
    query: { enabled: isConnected && !!address },
  })

  const { data: submissionData, isLoading: loadingSub } = useReadContracts({
    contracts: SKILLS.map((skill) => ({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'getSubmission' as const,
      args: [address!, BigInt(skill.id)] as const,
    })),
    query: { enabled: isConnected && !!address, refetchInterval: 12000 },
  })

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setEvidenceUrl('')
      setTimeout(reset, 3000)
    }
  }, [isSuccess, reset])

  const isLoading = isConnected && (loadingHas || loadingSub)

  const getSkillInfo = (skillIdx: number) => {
    const hasMinted = hasSkillData?.[skillIdx]?.result === true
    const sub = submissionData?.[skillIdx]?.result as
      | { evidenceURL: string; status: number }
      | undefined
    const isPending = sub?.status === 1
    return { hasMinted, isPending, evidenceURL: sub?.evidenceURL ?? '' }
  }

  const selectedIdx = SKILLS.findIndex((s) => s.id === selectedSkillId)
  const selectedInfo = selectedIdx >= 0 ? getSkillInfo(selectedIdx) : null
  const canSubmit =
    selectedInfo && !selectedInfo.hasMinted && !selectedInfo.isPending && evidenceUrl.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SKILL_QUEST_ABI,
      functionName: 'submitEvidence',
      args: [BigInt(selectedSkillId), evidenceUrl.trim()],
      dataSuffix: builderCode,
    })
  }

  if (!isConnected) {
    return (
      <EmptyState
        icon="🔌"
        title="Wallet Not Connected"
        message="Connect your wallet to submit evidence for a skill."
      />
    )
  }

  if (isLoading) return <Spinner />

  const pendingSkills = SKILLS.filter((_, i) => getSkillInfo(i).isPending)
  const mintedSkills = SKILLS.filter((_, i) => getSkillInfo(i).hasMinted)
  const availableSkills = SKILLS.filter(
    (_, i) => !getSkillInfo(i).hasMinted && !getSkillInfo(i).isPending,
  )

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-gold tracking-widest mb-3">
          SUBMIT EVIDENCE
        </h1>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-4" />
        <p className="font-body text-gray-500">
          Paste the link to your proof — GitHub repo, BaseScan tx, YouTube video, etc.
        </p>
      </div>

      {/* Pending badges */}
      {pendingSkills.length > 0 && (
        <div className="mb-6 card-dark">
          <p className="font-display text-xs text-amber-400 tracking-widest mb-3">
            ⏳ AWAITING REVIEW
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingSkills.map((s) => (
              <span
                key={s.id}
                className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400"
              >
                {s.icon} {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Minted summary */}
      {mintedSkills.length > 0 && (
        <div className="mb-6 card-dark">
          <p className="font-display text-xs text-gold tracking-widest mb-3">
            ✦ ALREADY MINTED
          </p>
          <div className="flex flex-wrap gap-2">
            {mintedSkills.map((s) => (
              <span
                key={s.id}
                className="text-xs font-body font-semibold px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold"
              >
                {s.icon} {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {availableSkills.length === 0 ? (
        <div className="card-dark text-center py-10">
          <p className="text-5xl mb-4">🏆</p>
          <p className="font-display text-gold text-lg tracking-widest">ALL SKILLS SUBMITTED</p>
          <p className="font-body text-gray-500 mt-2 text-sm">
            You have submitted or minted every skill.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-dark flex flex-col gap-5">
          {/* Skill selector */}
          <div>
            <label className="font-display text-xs text-gray-400 tracking-widest block mb-2">
              SKILL
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(Number(e.target.value))}
              className="input-dark appearance-none cursor-pointer"
            >
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.icon}  {skill.name} (Tier {skill.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Evidence URL */}
          <div>
            <label className="font-display text-xs text-gray-400 tracking-widest block mb-2">
              EVIDENCE URL
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://github.com/you/your-repo"
              className="input-dark"
              required
            />
          </div>

          {/* Status messages */}
          {isSuccess && (
            <div className="rounded bg-green-900/30 border border-green-500/30 px-4 py-3 text-green-400 font-body text-sm">
              ✓ Evidence submitted! The admin will review it shortly.
            </div>
          )}
          {writeError && (
            <div className="rounded bg-red-900/30 border border-red-500/30 px-4 py-3 text-red-400 font-body text-sm break-words">
              {(writeError as BaseError).shortMessage ?? writeError.message}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSigning || isConfirming}
            className="btn-gold"
          >
            {isSigning
              ? 'Confirm in Wallet…'
              : isConfirming
                ? 'Submitting…'
                : 'Submit Evidence'}
          </button>
        </form>
      )}
    </div>
  )
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
