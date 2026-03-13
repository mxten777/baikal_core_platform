import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { SiteConfig } from '@/types'

interface Props {
  site: SiteConfig
}

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Works', to: '/portfolio', feature: 'portfolio' as const },
  { label: 'Contact', to: '/contact', feature: 'contact' as const },
]

export function ExpertHeader({ site }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.feature || site.features[item.feature],
  )

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="text-sm font-bold tracking-widest uppercase text-white"
          >
            {site.name}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <span className="block w-4 h-px bg-current mb-1" />
            <span className="block w-4 h-px bg-current mb-1" />
            <span className="block w-4 h-px bg-current" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-gray-950 px-4 py-4 flex flex-col gap-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="text-xs tracking-widest uppercase text-gray-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
