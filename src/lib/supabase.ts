// ============================================================
// lib/supabase — Supabase Client (싱글톤)
//
// 규칙:
//   - 환경변수는 VITE_ 접두사 사용 (공개 키만 노출)
//   - Service Role Key는 절대 클라이언트에 포함하지 않음
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
