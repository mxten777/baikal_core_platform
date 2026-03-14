// ============================================================
// core/runtime — Site Resolver & Runtime Context Provider
//
// 책임:
//   - 도메인/슬러그로 SiteConfig 해석 (Site Resolver)
//   - RuntimeContext를 React Context로 제공
//   - 전체 플랫폼 부트스트랩 진입점
//
// 의존: core/settings (SiteConfig 로드)
// 비종속: 특정 site/template/module에 의존하지 않음
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { RuntimeContext } from '@/types'
import { settingsService } from '@core/settings'
import { authService } from '@core/auth'

// ------ Context ------

const RuntimeCtx = createContext<RuntimeContext | null>(null)

// ------ Provider ------

interface RuntimeProviderProps {
  children: ReactNode
  /** 단위 테스트 시 context를 직접 주입할 수 있도록 허용 */
  overrideContext?: RuntimeContext
}

export function RuntimeProvider({
  children,
  overrideContext,
}: RuntimeProviderProps) {
  const [ctx, setCtx] = useState<RuntimeContext | null>(
    overrideContext ?? null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (overrideContext) return // 테스트 오버라이드 사용 시 스킵

    async function boot() {
      try {
        // 1. 도메인/경로에서 site slug 해석
        const slug = resolveSiteSlug()

        // 2. SiteConfig 로드 (core/settings)
        const { data: site, error: siteErr } =
          await settingsService.loadSiteConfig(slug)
        if (siteErr || !site) throw new Error(siteErr?.message ?? 'Site not found')

        // 3. 현재 Auth User 로드 (없으면 null)
        const { data: user } = await authService.getCurrentUser()

        const isAdmin =
          user?.role === 'platform_admin' || user?.role === 'site_admin'

        setCtx({ site, user, isAdmin, locale: site.locale })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Boot failed')
      }
    }

    boot()
  }, [overrideContext])

  if (error) {
    return <div data-testid="runtime-error">Platform Error: {error}</div>
  }

  if (!ctx) {
    return <div data-testid="runtime-loading">Loading...</div>
  }

  return <RuntimeCtx.Provider value={ctx}>{children}</RuntimeCtx.Provider>
}

// ------ Hook ------

export function useRuntime(): RuntimeContext {
  const ctx = useContext(RuntimeCtx)
  if (!ctx) {
    throw new Error('useRuntime must be used inside <RuntimeProvider>')
  }
  return ctx
}

// ------ Site Resolver ------

/**
 * 현재 hostname/path에서 site slug를 결정하는 순수 함수.
 * - 운영환경: hostname 기반 (e.g. baikalsys.com → baikalsys)
 * - 개발환경: ?site= 쿼리 파라미터 또는 VITE_SITE_SLUG env 사용
 */
export function resolveSiteSlug(): string {
  // 1순위: 쿼리 파라미터 (개발 편의)
  const params = new URLSearchParams(window.location.search)
  const querySlug = params.get('site')
  if (querySlug) return querySlug

  // 2순위: Vite 환경변수
  const envSlug = import.meta.env.VITE_SITE_SLUG
  if (envSlug) return envSlug.trim()

  // 3순위: hostname 매핑
  return hostnameToSlug(window.location.hostname)
}

function hostnameToSlug(hostname: string): string {
  const defaultSlug: string = (import.meta.env.VITE_DEFAULT_SITE ?? 'baikalsys').trim()

  // localhost 개발 환경 기본값
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return defaultSlug
  }

  // www. 제거
  const clean = hostname.replace(/^www\./, '')

  // 알려진 호스팅 플랫폼 도메인: vercel.app, netlify.app 등
  // 이 경우 hostname에서 슬러그를 추출할 수 없으므로 기본값 사용
  const PLATFORM_DOMAINS = ['vercel.app', 'netlify.app', 'pages.dev', 'github.io']
  if (PLATFORM_DOMAINS.some((d) => clean.endsWith(d))) {
    return defaultSlug
  }

  // subdomain 기반: baikalsys.baikal.com → baikalsys
  const parts = clean.split('.')
  if (parts.length >= 3) return parts[0]

  // apex domain: baikalsys.com → baikalsys
  return parts[0]
}
