// ============================================================
// admin/pages — SiteProvisioningPage
//
// 책임:
//   - 신규 고객사 사이트 DB 등록 (platform_admin 전용)
//   - Organization → Site → SiteSettings 자동 생성
//   - 등록 완료 후 local fallback 설정 안내
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@core/auth'
import { provisioningService } from '@core/settings/provisioning.service'
import type { ProvisionSiteInput } from '@core/settings/provisioning.service'
import type { SiteType } from '@/types'

// 등록 가능한 템플릿 / 모듈 목록
const TEMPLATE_OPTIONS = [
  { value: 'corporate', label: 'Corporate (밝은 기업형)' },
  { value: 'expert', label: 'Expert (다크 전문가형)' },
]

const SITE_TYPE_OPTIONS: { value: SiteType; label: string }[] = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'expert', label: 'Expert' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'content', label: 'Content' },
]

const MODULE_OPTIONS = [
  { id: 'blog', label: '블로그' },
  { id: 'portfolio', label: '포트폴리오' },
  { id: 'contact', label: '문의 폼' },
]

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

interface FormState {
  orgName: string
  orgSlug: string
  siteName: string
  siteSlug: string
  domain: string
  type: SiteType
  templateId: string
  modules: string[]
  locale: string
  timezone: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string   // 쉼표 구분 입력
}

const INITIAL: FormState = {
  orgName: '',
  orgSlug: '',
  siteName: '',
  siteSlug: '',
  domain: '',
  type: 'corporate',
  templateId: 'corporate',
  modules: ['blog', 'contact'],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
}

export function SiteProvisioningPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ siteId: string; siteSlug: string } | null>(null)

  // platform_admin 권한 확인
  if (user?.role !== 'platform_admin') {
    return (
      <div className="p-8">
        <p className="text-red-600 font-medium">접근 권한이 없습니다. (platform_admin 전용)</p>
      </div>
    )
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleModule(id: string) {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(id)
        ? prev.modules.filter((m) => m !== id)
        : [...prev.modules, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.orgName || !form.orgSlug || !form.siteName || !form.siteSlug) {
      setError('필수 항목을 모두 입력하세요.')
      return
    }

    const input: ProvisionSiteInput = {
      orgName: form.orgName,
      orgSlug: form.orgSlug,
      siteName: form.siteName,
      siteSlug: form.siteSlug,
      domain: form.domain,
      type: form.type,
      templateId: form.templateId,
      modules: form.modules,
      locale: form.locale,
      timezone: form.timezone,
      meta: {
        title: form.metaTitle || form.siteName,
        description: form.metaDescription,
        keywords: form.metaKeywords
          ? form.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        ogImage: null,
        favicon: null,
      },
    }

    setSubmitting(true)
    const { data, error: err } = await provisioningService.provisionSite(input)
    setSubmitting(false)

    if (err) {
      setError(err.message)
      return
    }

    setResult({ siteId: data!.siteId, siteSlug: data!.siteSlug })
  }

  // 완료 화면
  if (result) {
    const modulesList = form.modules.length
      ? form.modules.map((m) => `'${m}'`).join(', ')
      : '(없음)'
    const featuresObj = MODULE_OPTIONS.reduce<Record<string, boolean>>((acc, m) => {
      acc[m.id] = form.modules.includes(m.id)
      return acc
    }, { booking: false, ecommerce: false, mediaHub: false })

    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-bold text-green-800 mb-1">사이트 등록 완료</h2>
          <p className="text-sm text-green-700">
            <span className="font-medium">{form.siteName}</span> 사이트가 DB에 등록되었습니다.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-800">
            <dt className="font-medium">Site ID</dt>
            <dd className="font-mono select-all">{result.siteId}</dd>
            <dt className="font-medium">Site Slug</dt>
            <dd className="font-mono">{result.siteSlug}</dd>
          </dl>
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-2">로컬 Fallback 설정 (개발용)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Supabase 연결 없이 로컬에서 테스트하려면 아래 파일을 생성하세요.
        </p>

        <pre className="bg-gray-900 text-green-300 text-xs rounded-lg p-4 overflow-x-auto mb-4 select-all whitespace-pre">{`// src/sites/${result.siteSlug}/site.config.ts
import type { SiteConfig } from '@/types'

export const ${result.siteSlug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}Config: SiteConfig = {
  siteId: '${result.siteId}',
  slug: '${result.siteSlug}',
  name: '${form.siteName}',
  domain: '${form.domain || ''}',
  type: '${form.type}',
  templateId: '${form.templateId}',
  modules: [${modulesList}],
  locale: '${form.locale}',
  timezone: '${form.timezone}',
  meta: {
    title: '${form.metaTitle || form.siteName}',
    description: '${form.metaDescription}',
    keywords: [${form.metaKeywords ? form.metaKeywords.split(',').map(k => `'${k.trim()}'`).join(', ') : ''}],
    ogImage: null,
    favicon: null,
  },
  features: ${JSON.stringify({ ...featuresObj, blog: form.modules.includes('blog'), portfolio: form.modules.includes('portfolio'), contact: form.modules.includes('contact') }, null, 4).replace(/\n/g, '\n  ')},
}`}</pre>

        <p className="text-xs text-gray-500 mb-4">
          생성 후 <code className="bg-gray-100 px-1 rounded">src/core/settings/settings.service.ts</code>의{' '}
          <code className="bg-gray-100 px-1 rounded">LOCAL_CONFIGS</code>에 import 및 추가하세요.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => { setForm(INITIAL); setResult(null) }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            새 사이트 추가
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
          >
            대시보드로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">신규 사이트 등록</h1>
      <p className="text-sm text-gray-500 mb-6">
        Organization → Site → SiteSettings를 DB에 자동 생성합니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section: Organization */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            고객사 (Organization)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고객사 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.orgName}
                onChange={(e) => {
                  set('orgName', e.target.value)
                  if (!form.orgSlug) set('orgSlug', toSlug(e.target.value))
                }}
                placeholder="ABC 컴퍼니"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                조직 Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.orgSlug}
                onChange={(e) => set('orgSlug', toSlug(e.target.value))}
                placeholder="abc-company"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">소문자·하이픈. 기존 조직이면 재사용됩니다.</p>
            </div>
          </div>
        </section>

        {/* Section: Site */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            사이트 기본 정보
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사이트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => {
                  set('siteName', e.target.value)
                  if (!form.siteSlug) set('siteSlug', toSlug(e.target.value))
                  if (!form.metaTitle) set('metaTitle', e.target.value)
                }}
                placeholder="ABC 컴퍼니 홈페이지"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사이트 Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.siteSlug}
                onChange={(e) => set('siteSlug', toSlug(e.target.value))}
                placeholder="abc-company"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">URL 식별자. 중복 불가.</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">도메인</label>
            <input
              type="text"
              value={form.domain}
              onChange={(e) => set('domain', e.target.value)}
              placeholder="abc-company.com (없으면 공백)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사이트 유형</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as SiteType)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SITE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">템플릿</label>
              <select
                value={form.templateId}
                onChange={(e) => set('templateId', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TEMPLATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section: Modules */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            활성화 모듈
          </h2>
          <div className="flex gap-6">
            {MODULE_OPTIONS.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.modules.includes(m.id)}
                  onChange={() => toggleModule(m.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {m.label}
              </label>
            ))}
          </div>
        </section>

        {/* Section: SEO */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            SEO 메타 정보
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">페이지 타이틀</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={form.siteName || 'ABC 컴퍼니'}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
                placeholder="사이트에 대한 간단한 설명"
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">키워드</label>
              <input
                type="text"
                value={form.metaKeywords}
                onChange={(e) => set('metaKeywords', e.target.value)}
                placeholder="abc, company, 홈페이지 (쉼표 구분)"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Section: Locale */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            로케일
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">언어</label>
              <select
                value={form.locale}
                onChange={(e) => set('locale', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ko">한국어 (ko)</option>
                <option value="en">English (en)</option>
                <option value="ja">日本語 (ja)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">타임존</label>
              <select
                value={form.timezone}
                onChange={(e) => set('timezone', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '등록 중...' : '사이트 등록'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
