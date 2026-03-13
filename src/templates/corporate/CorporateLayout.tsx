// ============================================================
// templates/corporate — Corporate Site Template
//
// 책임: 기업 홈페이지 레이아웃 (Header / Main / Footer)
// 의존: core/runtime (useRuntime — SiteConfig 읽기)
// 규칙: 콘텐츠 로직 없음, UI 구조만 담당
// ============================================================

import { Outlet } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { CorporateHeader } from './components/CorporateHeader'
import { CorporateFooter } from './components/CorporateFooter'

export function CorporateLayout() {
  const { site } = useRuntime()

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <CorporateHeader site={site} />
      <main className="flex-1">
        <Outlet />
      </main>
      <CorporateFooter site={site} />
    </div>
  )
}
