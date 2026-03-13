// ============================================================
// templates/expert — Expert/Portfolio Site Template
//
// 책임: 전문가 포트폴리오 사이트 레이아웃
//        단일 페이지 스크롤 + 사이드 네비게이션 구조
// ============================================================

import { Outlet } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { ExpertHeader } from './components/ExpertHeader'
import { ExpertFooter } from './components/ExpertFooter'

export function ExpertLayout() {
  const { site } = useRuntime()

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <ExpertHeader site={site} />
      <main className="flex-1">
        <Outlet />
      </main>
      <ExpertFooter site={site} />
    </div>
  )
}
