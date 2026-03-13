// ============================================================
// modules/contact — Contact Service
//
// 책임:
//   - forms 테이블에서 폼 스키마 로드
//   - form_submissions 테이블에 제출 데이터 저장
//   - 입력값 서버 측 검증 (XSS 방지)
// ============================================================

import { supabase } from '@lib/supabase'
import type { ApiResult } from '@/types'
import type { ContactForm, FormSubmission } from '../types/contact.types'

// ------ XSS 방지: 텍스트 값에서 HTML 태그 제거 ------
function sanitizeText(value: string): string {
  return value.replace(/<[^>]*>/g, '').slice(0, 2000)
}

function sanitizeData(
  data: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k.replace(/[^a-zA-Z0-9_-]/g, ''),   // key sanitize
      sanitizeText(v),
    ]),
  )
}

export const contactService = {
  async getForm(
    siteId: string,
    slug: string = 'contact',
  ): Promise<ApiResult<ContactForm>> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .eq('active', true)
      .single()

    if (error || !data) {
      return {
        data: null,
        error: { code: 'FORM_NOT_FOUND', message: error?.message ?? 'Form not found' },
      }
    }

    return {
      data: {
        id: data.id as string,
        siteId: data.site_id as string,
        name: data.name as string,
        slug: data.slug as string,
        schema: data.schema as ContactForm['schema'],
        emailTo: data.email_to as string[],
        active: data.active as boolean,
      },
      error: null,
    }
  },

  async submit(
    submission: FormSubmission,
  ): Promise<ApiResult<void>> {
    const cleanData = sanitizeData(submission.data)

    const { error } = await supabase.from('form_submissions').insert({
      form_id: submission.formId,
      site_id: submission.siteId,
      data: cleanData,
    })

    if (error) {
      return { data: null, error: { code: 'SUBMIT_FAILED', message: error.message } }
    }
    return { data: null, error: null }
  },
}
