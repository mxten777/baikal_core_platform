import type { RegisteredModule } from '@/app/registry/moduleRegistry'

export const portfolioModule: RegisteredModule = {
  definition: {
    id: 'portfolio',
    name: '포트폴리오',
    description: '프로젝트 목록/상세 전시',
    version: '1.0.0',
    requiredFeatures: ['portfolio'],
  },
  routes: [
    {
      path: 'portfolio',
      lazy: () =>
        import('./components/PortfolioListPage').then((m) => ({
          Component: m.PortfolioListPage,
        })),
    },
    {
      path: 'portfolio/:slug',
      lazy: () =>
        import('./components/PortfolioDetailPage').then((m) => ({
          Component: m.PortfolioDetailPage,
        })),
    },
  ],
}

export { portfolioService } from './services/portfolio.service'
export { useProjects } from './hooks/useProjects'
export type { Project, PortfolioListOptions } from './types/portfolio.types'
