// ============================================================
// BAIKAL Core Platform - Global Platform Types
// ============================================================

// ------ Site & Organization ------

export type SiteStatus = 'active' | 'inactive' | 'maintenance'
export type SiteType =
  | 'corporate'
  | 'hospital'
  | 'commerce'
  | 'expert'
  | 'portfolio'
  | 'content'

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface Site {
  id: string
  organizationId: string
  slug: string
  domain: string | null
  name: string
  type: SiteType
  status: SiteStatus
  templateId: string
  createdAt: string
  updatedAt: string
}

// ------ Site Config ------

export interface SiteConfig {
  siteId: string
  slug: string
  name: string
  domain: string
  type: SiteType
  templateId: string
  modules: string[]          // 활성화된 모듈 ID 목록
  locale: string
  timezone: string
  meta: SiteMetaConfig
  features: SiteFeatureFlags
}

export interface SiteMetaConfig {
  title: string
  description: string
  keywords: string[]
  ogImage: string | null
  favicon: string | null
}

export interface SiteFeatureFlags {
  blog: boolean
  portfolio: boolean
  contact: boolean
  booking: boolean
  ecommerce: boolean
  mediaHub: boolean
}

// ------ Runtime Context ------

export interface RuntimeContext {
  site: SiteConfig
  user: AuthUser | null
  isAdmin: boolean
  locale: string
}

// ------ Auth ------

export type UserRole = 'platform_admin' | 'site_admin' | 'editor' | 'viewer'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: UserRole
  siteId: string | null      // null이면 platform_admin
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  expiresAt: number
}

// ------ Content ------

export type ContentStatus = 'draft' | 'published' | 'archived'
export type ContentType = 'page' | 'post' | 'project' | 'product' | 'custom'

export interface Content {
  id: string
  siteId: string
  type: ContentType
  slug: string
  title: string
  body: string | null        // JSON string (rich content) or Markdown
  status: ContentStatus
  authorId: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  meta: ContentMeta
}

export interface ContentMeta {
  title: string | null
  description: string | null
  ogImage: string | null
  tags: string[]
  topics: string[]
}

// ------ Media ------

export type MediaType = 'image' | 'video' | 'document' | 'audio'

export interface MediaAsset {
  id: string
  siteId: string
  name: string
  url: string
  storagePath: string
  mimeType: string
  type: MediaType
  size: number               // bytes
  width: number | null
  height: number | null
  alt: string | null
  uploadedById: string
  createdAt: string
}

// ------ SEO ------

export interface SeoMeta {
  title: string
  description: string
  canonical: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  noIndex: boolean
  structuredData: Record<string, unknown> | null
}

// ------ Module ------

export interface ModuleDefinition {
  id: string
  name: string
  description: string
  version: string
  requiredFeatures: (keyof SiteFeatureFlags)[]
}

// ------ Template ------

export interface TemplateDefinition {
  id: string
  name: string
  supportedSiteTypes: SiteType[]
  layouts: string[]
}

// ------ Routing ------

export interface RouteConfig {
  path: string
  moduleId: string | null    // null이면 core 라우트
  contentType: ContentType | null
  isProtected: boolean
}

// ------ API Result ------

export interface ApiResult<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}
