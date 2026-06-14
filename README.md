# Token-ERC-20

An ERC-20 token implementation (MeuToken) with a staking system, built with Solidity and Hardhat as part of my Web3 development roadmap.

## Stack

- Solidity 0.8.24
- Hardhat
- OpenZeppelin Contracts
- TypeScript
- Frontend: React / Vite

## Contracts

- **MeuToken (ERC-20)** — custom token with mint and burn
- **StakingContract** — allows staking/unstaking of MeuToken with rewards

## Deployment (Base Sepolia)

| Contract | Address |
|---|---|
| MeuToken | `0x...` |
| StakingContract | `0x...` |

## Running locally

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Tests

Test coverage for the core mint, burn, stake, and unstake functions (see `test/` folder).

## Next steps

- Add ReentrancyGuard and Ownable
- Security audit
- Mainnet deployment

---

Built by [Dias](https://x.com/CryptoTheDias) — part of a public Solidity and Web3 security roadmap.
