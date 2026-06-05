import { type SkillData, TIER_ACCENT, TIER_LABELS, TIER_ROMAN } from '../lib/skills'

export type SkillStatus = 'locked' | 'pending' | 'minted'

interface Props {
  skill: SkillData
  status: SkillStatus
}

export default function SkillCard({ skill, status }: Props) {
  const accent = TIER_ACCENT[skill.tier]
  const isMinted = status === 'minted'
  const isPending = status === 'pending'

  return (
    <div
      className={`relative flex flex-col items-center gap-3 rounded-xl p-5 border transition-all duration-300 select-none ${
        isMinted
          ? 'border-gold/50 bg-gradient-to-b from-gold/8 to-card animate-glow-pulse'
          : isPending
            ? 'border-amber-500/40 bg-card animate-pulse'
            : 'border-white/6 bg-card opacity-55'
      }`}
    >
      {/* Tier badge */}
      <span
        className="text-[10px] font-display font-semibold tracking-widest px-2 py-0.5 rounded"
        style={{
          color: accent,
          border: `1px solid ${accent}55`,
          backgroundColor: `${accent}18`,
        }}
      >
        TIER {TIER_ROMAN[skill.tier]} · {TIER_LABELS[skill.tier]}
      </span>

      {/* Icon */}
      <span
        className={`text-5xl leading-none transition-all ${
          status === 'locked' ? 'grayscale opacity-30' : ''
        }`}
      >
        {skill.icon}
      </span>

      {/* Name */}
      <h3
        className={`font-display text-sm font-semibold text-center leading-tight ${
          isMinted ? 'text-gold' : 'text-gray-300'
        }`}
      >
        {skill.name}
      </h3>

      {/* Description */}
      <p className="font-body text-xs text-gray-600 text-center leading-snug">
        {skill.description}
      </p>

      {/* Status badge */}
      <StatusBadge status={status} />

      {/* Minted glow overlay */}
      {isMinted && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ boxShadow: 'inset 0 0 40px rgba(232,201,106,0.06)' }}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: SkillStatus }) {
  if (status === 'minted')
    return (
      <span className="text-[11px] font-body font-bold tracking-widest text-gold bg-gold/12 border border-gold/35 px-3 py-0.5 rounded-full">
        ✦ MINTED
      </span>
    )
  if (status === 'pending')
    return (
      <span className="text-[11px] font-body font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/35 px-3 py-0.5 rounded-full">
        ⏳ PENDING
      </span>
    )
  return (
    <span className="text-[11px] font-body font-bold tracking-widest text-gray-600 bg-white/4 border border-white/8 px-3 py-0.5 rounded-full">
      🔒 LOCKED
    </span>
  )
}
