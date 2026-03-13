import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { SiteConfig } from '@/types'
import { useAuth } from '@core/auth'

interface Props {
  site: SiteConfig
}

const NAV_ITEMS = [
  { label: '홈', to: '/' },
  { label: '소개', to: '/about' },
  { label: '블로그', to: '/blog', feature: 'blog' as const },
  { label: '문의', to: '/contact', feature: 'contact' as const },
]

export function CorporateHeader({ site }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.feature || site.features[item.feature],
  )

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900">
            {site.name}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <Link
                  to="/admin"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  관리자
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 pl-4 border-l border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                로그인
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-gray-500 hover:text-gray-900"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="text-sm text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                관리자
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false) }}
                className="text-sm text-left text-gray-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              로그인
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
