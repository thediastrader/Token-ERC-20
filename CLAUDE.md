# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SkillQuest — an onchain skill achievement NFT system built on Base. Each milestone unlocked mints an ERC-721 NFT. Personal system first, built to scale public later.

## Commands

```bash
npm install                                              # install deps (first time)
npx hardhat compile                                      # compile contracts + generate typechain
npx hardhat test                                         # run all tests
npx hardhat test test/SkillQuest.test.ts                 # run a single test file
npx hardhat run scripts/deploy.ts --network baseSepolia  # deploy to Base Sepolia testnet
npx hardhat run scripts/addSkills.ts --network baseSepolia  # seed all 9 skills on-chain
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> # verify on Basescan
```

## Stack

- **Solidity 0.8.24** + **OpenZeppelin v5** (ERC-721, Ownable)
- **Hardhat** with `hardhat-toolbox` (ethers v6, typechain, chai)
- **TypeScript** throughout (contracts, scripts, tests)
- **Network:** Base Sepolia testnet → Base Mainnet

## Contract Architecture (`contracts/SkillQuest.sol`)

Single contract, no upgradability. Key design decisions:

- **Admin = contract owner** (Ownable). Only admin can add skills and mint NFTs.
- **Skill registry:** `skillId → Skill{name, tier, metadataURI, exists}`. Tiers 1–3 only.
- **Submission state machine:** `None → Pending → Approved | Rejected`. Rejected submissions can be resubmitted. Approved submissions are permanent.
- **One NFT per skill per wallet** enforced at both `submitEvidence` (checks `hasSkill`) and `approveAndMint` (double-check).
- **tokenURI** returns the skill's `metadataURI` directly — no base URI concatenation.
- `skillTokenId[user][skillId]` maps back from a skill to its tokenId for easy lookup.

## Environment Variables

Copy `.env.example` to `.env` before deploying:

```
PRIVATE_KEY=            # wallet private key (no 0x prefix)
BASE_SEPOLIA_RPC_URL=   # defaults to https://sepolia.base.org if omitted
BASESCAN_API_KEY=       # optional, for contract verification
CONTRACT_ADDRESS=       # fill after deploy, needed by addSkills.ts
```

## Skill IDs

IDs 1–9 are reserved for the initial skill tree (see `scripts/addSkills.ts`). Future skills should start at 10+. Update the IPFS URIs in `addSkills.ts` before running on mainnet.

## Current Status

- [x] Smart contract written
- [x] Tests passing
- [ ] Deployed on Base Sepolia
- [ ] Skills added on-chain
- [ ] Frontend (next phase)
