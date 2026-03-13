// modules/blog 전용 타입
import type { Content } from '@/types'

export interface BlogPost extends Content {
  type: 'post'
}

export interface BlogListOptions {
  siteId: string
  tag?: string
  topic?: string
  page?: number
  pageSize?: number
}
