// ============================================================
// core/media — Media Asset Service
//
// 책임:
//   - Supabase Storage 파일 업로드/삭제
//   - media_assets 테이블 메타데이터 관리
//   - 이미지 공개 URL 생성
//   - 사이트별 미디어 목록 조회
//
// 의존: lib/supabase
// 비종속: 특정 모듈 없음
// ============================================================

import type { MediaAsset, MediaType, ApiResult } from '@/types'
import { supabase } from '@lib/supabase'

const BUCKET = 'media'

function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}

function buildStoragePath(siteId: string, fileName: string): string {
  const ts = Date.now()
  const ext = fileName.split('.').pop() ?? ''
  const safe = fileName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .slice(0, 60)
  return `sites/${siteId}/${ts}-${safe}.${ext}`
}

export const mediaService = {
  /**
   * 파일을 Supabase Storage에 업로드하고 media_assets에 기록한다.
   */
  async upload(
    siteId: string,
    uploaderId: string,
    file: File,
    alt?: string,
  ): Promise<ApiResult<MediaAsset>> {
    const storagePath = buildStoragePath(siteId, file.name)

    // 1. Storage 업로드
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      return {
        data: null,
        error: { code: 'UPLOAD_FAILED', message: uploadErr.message },
      }
    }

    // 2. 공개 URL 획득
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    // 3. 메타데이터 저장
    const { data, error: dbErr } = await supabase
      .from('media_assets')
      .insert({
        site_id: siteId,
        name: file.name,
        url: urlData.publicUrl,
        storage_path: storagePath,
        mime_type: file.type,
        type: detectMediaType(file.type),
        size: file.size,
        alt: alt ?? null,
        uploaded_by_id: uploaderId,
      })
      .select()
      .single()

    if (dbErr || !data) {
      return { data: null, error: { code: 'DB_INSERT_FAILED', message: dbErr?.message ?? 'Insert failed' } }
    }

    return { data: data as MediaAsset, error: null }
  },

  async getList(siteId: string): Promise<ApiResult<MediaAsset[]>> {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: { code: 'MEDIA_LIST_FAILED', message: error.message } }
    }
    return { data: (data as MediaAsset[]) ?? [], error: null }
  },

  async delete(assetId: string, storagePath: string): Promise<ApiResult<void>> {
    // 1. Storage 삭제
    const { error: storageErr } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath])

    if (storageErr) {
      return { data: null, error: { code: 'STORAGE_DELETE_FAILED', message: storageErr.message } }
    }

    // 2. DB 삭제
    const { error: dbErr } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', assetId)

    if (dbErr) {
      return { data: null, error: { code: 'DB_DELETE_FAILED', message: dbErr.message } }
    }

    return { data: null, error: null }
  },
}
