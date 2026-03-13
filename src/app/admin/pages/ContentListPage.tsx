// ============================================================
// admin/pages — ContentListPage
//
// 책임:
//   - 사이트 내 모든 콘텐츠 목록 표시 (draft 포함)
//   - 콘텐츠 타입 필터 (post / page / project)
//   - publish / archive 액션
//   - 새 콘텐츠 생성 링크
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { useAuth } from '@core/auth'
import { cmsService } from '@core/cms'
import type { Content, ContentType, ContentStatus } from '@/types'

const TYPE_OPTIONS: { value: ContentType | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'post', label: '포스트' },
  { value: 'page', label: '페이지' },
  { value: 'project', label: '프로젝트' },
]

const STATUS_BADGE: Record<ContentStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안',
  published: '발행됨',
  archived: '보관됨',
}

export function ContentListPage() {
  const { site } = useRuntime()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const typeParam = (searchParams.get('type') ?? '') as ContentType | ''
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await cmsService.listAll(
      user,
      site.siteId,
      typeParam as ContentType || undefined,
    )
    setItems(data ?? [])
    setLoading(false)
  }, [user, site.siteId, typeParam])

  useEffect(() => { load() }, [load])

  async function handlePublish(id: string) {
    if (!user) return
    setActionId(id)
    await cmsService.publish(user, id)
    await load()
    setActionId(null)
  }

  async function handleArchive(id: string) {
    if (!user) return
    setActionId(id)
    await cmsService.archive(user, id)
    await load()
    setActionId(null)
  }

  function setTypeFilter(type: ContentType | '') {
    if (type) {
      setSearchParams({ type })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
        <Link
          to={`/admin/content/new${typeParam ? `?type=${typeParam}` : ''}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + 새 콘텐츠
        </Link>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 mb-6">
        {TYPE_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              typeParam === value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400">로딩 중...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-sm">콘텐츠가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">타입</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">수정일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/_{item.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGE[item.status]}`}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/admin/content/${item.id}/edit`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        편집
                      </Link>
                      {item.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(item.id)}
                          disabled={actionId === item.id}
                          className="text-green-600 hover:underline text-xs disabled:opacity-50"
                        >
                          발행
                        </button>
                      )}
                      {item.status === 'published' && (
                        <button
                          onClick={() => handleArchive(item.id)}
                          disabled={actionId === item.id}
                          className="text-gray-500 hover:underline text-xs disabled:opacity-50"
                        >
                          보관
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
