// ============================================================
// admin/pages — ContentEditorPage
//
// 책임:
//   - 콘텐츠 생성 (new) 또는 편집 (/:id/edit) 모드
//   - 제목, slug, 본문, 타입, 상태 필드
//   - slug 중복 검사
//   - 초안 저장 / 즉시 발행 버튼
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { useAuth } from '@core/auth'
import { contentService } from '@core/content'
import { cmsService } from '@core/cms'
import type { ContentType } from '@/types'

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'post', label: '포스트' },
  { value: 'page', label: '페이지' },
  { value: 'project', label: '프로젝트' },
]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function ContentEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { site } = useRuntime()
  const { user } = useAuth()

  const isEdit = !!id

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<ContentType>(
    (searchParams.get('type') as ContentType) ?? 'post',
  )
  const [slugError, setSlugError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  // 편집 모드: 기존 콘텐츠 로드
  useEffect(() => {
    if (!isEdit) return
    contentService.getById(id!).then(({ data, error }) => {
      if (error || !data) {
        setLoadError('콘텐츠를 불러올 수 없습니다.')
        return
      }
      setTitle(data.title)
      setSlug(data.slug)
      setBody(data.body ?? '')
      setType(data.type)
    })
  }, [id, isEdit])

  // title → slug 자동 생성 (신규 모드만)
  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) {
      setSlug(slugify(value))
    }
  }

  async function checkSlug(value: string) {
    if (!value) return
    const available = await cmsService.isSlugAvailable(site.siteId, value, id)
    setSlugError(available ? '' : '이미 사용 중인 slug입니다.')
  }

  async function save(publish: boolean) {
    if (!user) return
    if (!title.trim() || !slug.trim()) {
      alert('제목과 slug를 입력해주세요.')
      return
    }
    if (slugError) {
      alert('slug를 수정해주세요.')
      return
    }
    setSaving(true)

    const status = publish ? 'published' : 'draft'
    const publishedAt = publish ? new Date().toISOString() : undefined

    if (isEdit) {
      const { error } = await contentService.update(id!, {
        title,
        body,
        status,
        ...(publishedAt && { publishedAt }),
      })
      if (error) {
        alert(`저장 실패: ${error.message}`)
      } else {
        navigate('/admin/content')
      }
    } else {
      const { error } = await contentService.create({
        siteId: site.siteId,
        type,
        slug,
        title,
        body,
        status,
        authorId: user.id,
        publishedAt: publishedAt ?? null,
        meta: { title: null, description: null, ogImage: null, tags: [], topics: [] },
      })
      if (error) {
        alert(`생성 실패: ${error.message}`)
      } else {
        navigate('/admin/content')
      }
    }
    setSaving(false)
  }

  if (loadError) {
    return (
      <div className="p-8">
        <p className="text-red-500">{loadError}</p>
        <Link to="/admin/content" className="text-blue-600 text-sm mt-2 block">
          ← 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '콘텐츠 편집' : '새 콘텐츠'}
        </h1>
        <Link to="/admin/content" className="text-sm text-gray-500 hover:text-gray-700">
          ← 목록으로
        </Link>
      </div>

      <div className="space-y-5">
        {/* Type (신규 모드만) */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              콘텐츠 타입
            </label>
            <div className="flex gap-3">
              {TYPE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="콘텐츠 제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugError('')
            }}
            onBlur={(e) => checkSlug(e.target.value)}
            placeholder="url-friendly-slug"
            className={`w-full px-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              slugError ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {slugError && (
            <p className="mt-1 text-xs text-red-500">{slugError}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            URL: /{slug}
          </p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            본문
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder="마크다운 또는 HTML 본문을 작성하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '초안 저장'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '발행하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
