// ============================================================
// sites/demo-site/site.config.ts
//
// 전문가(Expert) 포트폴리오 데모 사이트 설정
// ============================================================

import type { SiteConfig } from '@/types'

export const demoSiteConfig: SiteConfig = {
  siteId: '10000000-0000-0000-0000-000000000002',
  slug: 'demo-site',
  name: 'Demo Expert Site',
  domain: 'demo.baikal.dev',
  type: 'expert',
  templateId: 'expert',
  modules: ['portfolio', 'contact'],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  meta: {
    title: 'Demo Expert',
    description: '전문가 포트폴리오 데모 사이트',
    keywords: ['demo', 'expert', 'portfolio'],
    ogImage: null,
    favicon: null,
  },
  features: {
    blog: false,
    portfolio: true,
    contact: true,
    booking: false,
    ecommerce: false,
    mediaHub: false,
  },
}
