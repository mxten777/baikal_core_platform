import type { Content } from '@/types'

export interface Project extends Content {
  type: 'project'
  // projects 테이블 JOIN 데이터
  client?: string
  url?: string
  stack?: string[]
  featured?: boolean
}

export interface PortfolioListOptions {
  siteId: string
  featured?: boolean
  page?: number
  pageSize?: number
}
