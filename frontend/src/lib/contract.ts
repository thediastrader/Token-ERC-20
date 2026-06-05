export const CONTRACT_ADDRESS = '0x010bcA8a75f9012fe213A593989785DE1121eEe2' as const

// Block at which SkillQuest was deployed on Base Sepolia.
// getLogs on the public RPC is capped at 10,000 blocks per request,
// so we paginate from this block forward rather than scanning from 0.
export const DEPLOY_BLOCK = 40_992_671n

export const SKILL_QUEST_ABI = [
  // ─── Admin ───────────────────────────────────────────────────────────────────
  {
    name: 'approveAndMint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'skillId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'rejectSubmission',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'skillId', type: 'uint256' },
    ],
    outputs: [],
  },
  // ─── User ────────────────────────────────────────────────────────────────────
  {
    name: 'submitEvidence',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'skillId', type: 'uint256' },
      { name: 'evidenceURL', type: 'string' },
    ],
    outputs: [],
  },
  // ─── View ────────────────────────────────────────────────────────────────────
  {
    name: 'hasSkill',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'skillId', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'getSkill',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'skillId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'tier', type: 'uint8' },
          { name: 'metadataURI', type: 'string' },
          { name: 'exists', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'getSubmission',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'skillId', type: 'uint256' },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'evidenceURL', type: 'string' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // ─── Events ──────────────────────────────────────────────────────────────────
  {
    name: 'EvidenceSubmitted',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'skillId', type: 'uint256', indexed: true },
      { name: 'evidenceURL', type: 'string', indexed: false },
    ],
  },
  {
    name: 'SkillMinted',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'skillId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'SubmissionRejected',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'skillId', type: 'uint256', indexed: true },
    ],
  },
] as const
