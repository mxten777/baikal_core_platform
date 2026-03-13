// ============================================================
// admin/pages — MediaPage
//
// 책임:
//   - 사이트 미디어 자산 목록 (그리드 뷰)
//   - 파일 업로드 (드래그&드롭 + 파일 선택)
//   - URL 클립보드 복사
//   - 삭제
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useRuntime } from '@core/runtime'
import { useAuth } from '@core/auth'
import { mediaService } from '@core/media'
import type { MediaAsset } from '@/types'

const ACCEPTED_TYPES = 'image/*,video/*,audio/*,.pdf,.doc,.docx'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPage() {
  const { site } = useRuntime()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await mediaService.getList(site.siteId)
    setAssets(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [site.siteId])  // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadFiles(files: FileList | File[]) {
    if (!user) return
    setUploading(true)
    const list = Array.from(files)
    for (const file of list) {
      await mediaService.upload(site.siteId, user.id, file)
    }
    await load()
    setUploading(false)
  }

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`"${asset.name}"을 삭제하시겠습니까?`)) return
    await mediaService.delete(asset.id, asset.storagePath)
    setAssets((prev) => prev.filter((a) => a.id !== asset.id))
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">미디어 라이브러리</h1>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sm text-blue-600 font-medium">업로드 중...</p>
        ) : (
          <>
            <p className="text-3xl mb-2">⬆️</p>
            <p className="text-sm font-medium text-gray-600">
              클릭하거나 파일을 드래그하여 업로드
            </p>
            <p className="text-xs text-gray-400 mt-1">
              이미지, 동영상, 오디오, 문서 파일 지원
            </p>
          </>
        )}
      </div>

      {/* Asset grid */}
      {loading ? (
        <p className="text-sm text-gray-400">로딩 중...</p>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🖼</p>
          <p className="text-sm">업로드된 미디어가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              {asset.type === 'image' ? (
                <img
                  src={asset.url}
                  alt={asset.alt ?? asset.name}
                  className="w-full h-28 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-3xl">
                  {asset.type === 'video' ? '🎬' : asset.type === 'audio' ? '🎵' : '📄'}
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(asset.url)}
                  className="px-2 py-1 bg-white text-gray-800 text-xs rounded font-medium hover:bg-gray-100"
                  title="URL 복사"
                >
                  {copied === asset.url ? '✓ 복사됨' : 'URL 복사'}
                </button>
                <button
                  onClick={() => handleDelete(asset)}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded font-medium hover:bg-red-700"
                  title="삭제"
                >
                  삭제
                </button>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={asset.name}>
                  {asset.name}
                </p>
                <p className="text-xs text-gray-400">{formatBytes(asset.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
