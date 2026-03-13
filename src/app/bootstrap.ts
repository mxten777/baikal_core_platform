// ============================================================
// app/bootstrap.ts — Platform Bootstrap
//
// 책임:
//   - 모든 module과 template을 registry에 등록
//   - 이 파일이 실행되어야 registry가 초기화됨
//   - main.tsx에서 import만 하면 자동 실행
// ============================================================

import { templateRegistry } from './registry/templateRegistry'
import { moduleRegistry } from './registry/moduleRegistry'
import { homeRegistry } from './registry/homeRegistry'

// ---- Templates ----
import { CorporateLayout } from '@templates/corporate'
import { ExpertLayout } from '@templates/expert'
import { CorporateHomePage } from '@templates/corporate/pages/CorporateHomePage'
import { ExpertHomePage } from '@templates/expert/pages/ExpertHomePage'

templateRegistry.register('corporate', CorporateLayout)
templateRegistry.register('expert', ExpertLayout)
homeRegistry.register('corporate', CorporateHomePage)
homeRegistry.register('expert', ExpertHomePage)

// ---- Modules ----
import { blogModule } from '@modules/blog'
import { portfolioModule } from '@modules/portfolio'
import { contactModule } from '@modules/contact'

moduleRegistry.register('blog', blogModule)
moduleRegistry.register('portfolio', portfolioModule)
moduleRegistry.register('contact', contactModule)

// 개발 중 등록 확인용 로그 (운영 환경에서는 제거)
if (process.env.NODE_ENV !== 'production') {
  console.log('[BAIKAL] Bootstrap complete', {
    templates: Array.from((templateRegistry as unknown as { store: Map<string, unknown> }).store?.keys() ?? []),
    modules: Array.from((moduleRegistry as unknown as { store: Map<string, unknown> }).store?.keys() ?? []),
  })
}

export { templateRegistry, moduleRegistry }
