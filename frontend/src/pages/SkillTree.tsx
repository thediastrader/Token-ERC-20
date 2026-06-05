import { useAccount, useReadContracts } from 'wagmi'
import { SKILLS, TIER_LABELS, TIER_ROMAN, TIER_ACCENT } from '../lib/skills'
import { CONTRACT_ADDRESS, SKILL_QUEST_ABI } from '../lib/contract'
import SkillCard, { type SkillStatus } from '../components/SkillCard'
import Spinner from '../components/Spinner'

const TIERS = [1, 2, 3] as const

export default function SkillTree() {
  const { address, isConnected } = useAccount()

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
    query: { enabled: isConnected && !!address },
  })

  const isLoading = isConnected && (loadingHas || loadingSub)

  const getStatus = (index: number): SkillStatus => {
    if (!isConnected) return 'locked'
    if (hasSkillData?.[index]?.result === true) return 'minted'
    const sub = submissionData?.[index]?.result as
      | { evidenceURL: string; status: number }
      | undefined
    if (sub?.status === 1) return 'pending'
    return 'locked'
  }

  const mintedCount = SKILLS.filter((_, i) => getStatus(i) === 'minted').length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl font-bold text-gold tracking-[0.15em] mb-3">
          SKILL TREE
        </h1>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-5" />
        {isConnected ? (
          <p className="font-body text-gray-400 text-lg">
            <span className="text-gold font-bold">{mintedCount}</span>
            <span className="text-gray-600"> / </span>
            <span>{SKILLS.length}</span>
            <span className="ml-2">skills unlocked</span>
          </p>
        ) : (
          <p className="font-body text-gray-600">
            Connect your wallet to track your progress
          </p>
        )}
      </div>

      {/* Progress bar */}
      {isConnected && !isLoading && (
        <div className="mb-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(mintedCount / SKILLS.length) * 100}%`,
              background: 'linear-gradient(90deg, #3a7a4a, #4a6aaa, #8a5aaa)',
            }}
          />
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        TIERS.map((tier) => {
          const tierSkills = SKILLS.filter((s) => s.tier === tier)
          const accent = TIER_ACCENT[tier]

          return (
            <div key={tier} className="mb-14">
              {/* Tier header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="h-px flex-1 opacity-30"
                  style={{ backgroundColor: accent }}
                />
                <h2
                  className="font-display text-xs font-bold tracking-[0.2em] whitespace-nowrap"
                  style={{ color: accent }}
                >
                  TIER {TIER_ROMAN[tier]} — {TIER_LABELS[tier]}
                </h2>
                <div
                  className="h-px flex-1 opacity-30"
                  style={{ backgroundColor: accent }}
                />
              </div>

              {/* 3-column grid */}
              <div className="grid grid-cols-3 gap-4">
                {tierSkills.map((skill) => {
                  const globalIdx = SKILLS.findIndex((s) => s.id === skill.id)
                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      status={getStatus(globalIdx)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
