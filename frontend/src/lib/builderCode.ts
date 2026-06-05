import { type Hex } from 'viem'

// ERC-8021 Base Builder Code appended as a dataSuffix on every write transaction.
// Set VITE_BUILDER_CODE in .env (with or without the 0x prefix).
// If unset the dataSuffix is omitted and transactions are untagged.
const raw = import.meta.env.VITE_BUILDER_CODE as string | undefined

export const builderCode: Hex | undefined = raw
  ? ((raw.startsWith('0x') ? raw : `0x${raw}`) as Hex)
  : undefined
