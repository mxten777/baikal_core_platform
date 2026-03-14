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

if (import.meta.env.DEV) {
  console.log('[BAIKAL] Bootstrap complete', {
    templates: templateRegistry.keys(),
    modules: moduleRegistry.keys(),
  })
}

export { templateRegistry, moduleRegistry }
