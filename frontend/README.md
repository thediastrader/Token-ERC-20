# SkillQuest Frontend

React + Vite frontend for the SkillQuest onchain skill achievement system.

## Prerequisites

- Node.js 18+
- A wallet with Base Sepolia ETH (for submitting evidence or admin actions)
- A WalletConnect Project ID (free at https://cloud.walletconnect.com)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — add your WalletConnect Project ID
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes (for WalletConnect) | Get one free at cloud.walletconnect.com |
| `VITE_RPC_URL` | No | Overrides the default Base Sepolia public RPC |

> MetaMask (injected wallet) works without a WalletConnect project ID.

## Contract

- **Address:** `0x010bcA8a75f9012fe213A593989785DE1121eEe2`
- **Network:** Base Sepolia (Chain ID 84532)

## Pages

| Route | Description |
|---|---|
| `/` | Skill Tree — 3-tier grid showing LOCKED / PENDING / MINTED status |
| `/submit` | Submit Evidence — select a skill, paste a URL, send the tx |
| `/admin` | Admin Panel — visible only to contract owner; approve or reject submissions |

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```
