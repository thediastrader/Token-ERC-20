import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { baseSepolia } from 'viem/chains'
import { http } from 'wagmi'

export const wagmiConfig = getDefaultConfig({
  appName: 'SkillQuest',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(import.meta.env.VITE_RPC_URL),
  },
})
