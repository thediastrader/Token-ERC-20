import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, SKILL_QUEST_ABI } from '../lib/contract'

export default function Navigation() {
  const { pathname } = useLocation()
  const { address } = useAccount()

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILL_QUEST_ABI,
    functionName: 'owner',
  })

  const isOwner =
    address && owner && address.toLowerCase() === (owner as string).toLowerCase()

  return (
    <nav className="sticky top-0 z-50 border-b border-gold/15 bg-bg/90 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="font-display text-gold font-bold text-lg tracking-widest shrink-0">
          ⚔ SKILLQUEST
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" active={pathname === '/'}>Skill Tree</NavLink>
          <NavLink to="/submit" active={pathname === '/submit'}>Submit</NavLink>
          {isOwner && (
            <NavLink to="/admin" active={pathname === '/admin'}>Admin</NavLink>
          )}
        </div>

        {/* Wallet */}
        <div className="shrink-0">
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>
    </nav>
  )
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`px-4 py-1.5 rounded text-xs font-body font-bold tracking-widest uppercase transition-colors ${
        active
          ? 'text-gold bg-gold/10'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  )
}
