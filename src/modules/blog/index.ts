// ============================================================
// modules/blog — index.ts
// Module 정의 + Route 등록
// ============================================================

import type { RegisteredModule } from '@/app/registry/moduleRegistry'

export const blogModule: RegisteredModule = {
  definition: {
    id: 'blog',
    name: '블로그',
    description: '포스트 작성/발행/목록 조회',
    version: '1.0.0',
    requiredFeatures: ['blog'],
  },
  routes: [
    {
      path: 'blog',
      lazy: () =>
        import('./components/BlogListPage').then((m) => ({
          Component: m.BlogListPage,
        })),
    },
    {
      path: 'blog/:slug',
      lazy: () =>
        import('./components/BlogDetailPage').then((m) => ({
          Component: m.BlogDetailPage,
        })),
    },
  ],
}

export { blogService } from './services/blog.service'
export { useBlogPosts } from './hooks/useBlogPosts'
export type { BlogPost, BlogListOptions } from './types/blog.types'
