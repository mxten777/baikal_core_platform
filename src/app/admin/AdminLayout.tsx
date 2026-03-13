import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@core/auth'

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/content', label: '콘텐츠' },
  { to: '/admin/submissions', label: '폼 제출' },
  { to: '/admin/media', label: '미디어' },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 text-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-700">
          <span className="font-bold text-white text-sm tracking-wide">BAIKAL Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700 text-xs text-gray-400">
          <p className="truncate mb-2">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
