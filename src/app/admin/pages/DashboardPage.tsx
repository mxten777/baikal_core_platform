// ============================================================
// admin/pages — DashboardPage
//
// 책임: Admin 홈 — 빠른 링크 및 현재 사이트 정보 표시
// ============================================================

import { Link } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { useAuth } from '@core/auth'

export function DashboardPage() {
  const { site } = useRuntime()
  const { user } = useAuth()

  const QUICK_LINKS = [
    { to: '/admin/content?type=post', label: '새 포스트 작성', icon: '📝' },
    { to: '/admin/content?type=page', label: '새 페이지 작성', icon: '📄' },
    { to: '/admin/submissions', label: '폼 제출 확인', icon: '📬' },
    { to: '/admin/media', label: '미디어 라이브러리', icon: '🖼' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          {site.name} — 안녕하세요,{' '}
          <span className="font-medium text-gray-700">{user?.email}</span>님
        </p>
      </div>

      {/* Site info card */}
      <div className="mb-8 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          현재 사이트
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-gray-500">사이트명</dt>
          <dd className="text-gray-900 font-medium">{site.name}</dd>
          <dt className="text-gray-500">도메인</dt>
          <dd className="text-gray-900 font-medium">{site.domain}</dd>
          <dt className="text-gray-500">템플릿</dt>
          <dd className="text-gray-900 font-medium">{site.templateId}</dd>
          <dt className="text-gray-500">활성 모듈</dt>
          <dd className="text-gray-900 font-medium">{site.modules.join(', ')}</dd>
        </dl>
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        빠른 작업
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
