// ============================================================
// admin/pages — FormSubmissionsPage
//
// 책임:
//   - form_submissions 테이블 조회 (현재 사이트 기준)
//   - 폼별 필터
//   - 제출 데이터 상세 보기 (모달)
// ============================================================

import { useState, useEffect } from 'react'
import { useRuntime } from '@core/runtime'
import { supabase } from '@lib/supabase'

interface Submission {
  id: string
  form_id: string
  site_id: string
  data: Record<string, string>
  created_at: string
  forms?: { name: string } | null
}

export function FormSubmissionsPage() {
  const { site } = useRuntime()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('form_submissions')
        .select('*, forms(name)')
        .eq('site_id', site.siteId)
        .order('created_at', { ascending: false })
        .limit(100)
      setSubmissions((data as Submission[]) ?? [])
      setLoading(false)
    }
    load()
  }, [site.siteId])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">폼 제출 목록</h1>

      {loading ? (
        <p className="text-sm text-gray-400">로딩 중...</p>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-sm">제출된 폼이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">폼</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">요약</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">제출 시각</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((s) => {
                const keys = Object.keys(s.data)
                const preview = keys.slice(0, 2).map((k) => `${k}: ${s.data[k]}`).join(' | ')
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {s.forms?.name ?? s.form_id}
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                      {preview}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(s.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(s)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selected.forms?.name ?? selected.form_id}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {new Date(selected.created_at).toLocaleString('ko-KR')}
            </p>
            <dl className="space-y-3">
              {Object.entries(selected.data).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {key}
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
