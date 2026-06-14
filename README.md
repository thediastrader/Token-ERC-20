# Token-ERC-20

Implementação de um token ERC-20 (MeuToken) com sistema de staking, construído com Solidity e Hardhat como parte do meu roadmap de desenvolvimento Web3.

## Stack

- Solidity 0.8.24
- Hardhat
- OpenZeppelin Contracts
- TypeScript
- Frontend: React / Vite

## Contratos

- **MeuToken (ERC-20)** — token customizado com mint e burn
- **StakingContract** — permite stake/unstake de MeuToken com recompensas

## Deploy (Base Sepolia)

| Contrato | Endereço |
|---|---|
| MeuToken | `0x...` |
| StakingContract | `0x...` |

## Como rodar localmente

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Testes

Cobertura de testes para as funções principais de mint, burn, stake e unstake (ver pasta `test/`).

## Próximos passos

- Adicionar ReentrancyGuard e Ownable
- Auditoria de segurança
- Deploy em mainnet

---

Feito por [Dias](https://x.com/CryptoTheDias) — parte de um roadmap público de Solidity e Web3 security.
