// ============================================================
// sites/baikalsys/site.config.ts
//
// Baikal Systems 공식 사이트 설정 (corporate 타입)
// DB에 없을 때 fallback 또는 개발 환경에서 직접 사용
// ============================================================

import type { SiteConfig } from '@/types'

export const baikalsysConfig: SiteConfig = {
  siteId: '10000000-0000-0000-0000-000000000001',
  slug: 'baikalsys',
  name: 'Baikal Systems',
  domain: 'baikalsys.com',
  type: 'corporate',
  templateId: 'corporate',
  modules: ['blog', 'contact'],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  meta: {
    title: 'Baikal Systems',
    description: '기업 홈페이지 플랫폼',
    keywords: ['baikal', 'platform', 'web'],
    ogImage: null,
    favicon: null,
  },
  features: {
    blog: true,
    portfolio: false,
    contact: true,
    booking: false,
    ecommerce: false,
    mediaHub: false,
  },
}
