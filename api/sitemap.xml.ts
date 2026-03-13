// ============================================================
// api/sitemap.xml — Vercel Serverless Function
//
// 책임: 현재 사이트의 sitemap.xml 생성하여 반환
//
// 환경변수:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, PUBLIC_SITE_ID
//
// Vercel 배포 시 /api/sitemap.xml 경로로 접근 가능.
// vercel.json 에서 /sitemap.xml → /api/sitemap.xml 로 rewrite 설정 필요.
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

async function generateSitemap(siteId: string, baseUrl: string): Promise<string> {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  )

  const { data } = await supabase
    .from('contents')
    .select('slug, type, published_at, updated_at')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000)

  const entries: string[] = []

  // 홈
  entries.push(urlEntry(baseUrl, undefined, 'daily', 1.0))

  for (const row of data ?? []) {
    const slug = row.type === 'post' ? `blog/${row.slug}` : row.slug
    entries.push(
      urlEntry(
        `${baseUrl}/${slug}`,
        (row.published_at ?? row.updated_at ?? '').split('T')[0],
        row.type === 'post' ? 'weekly' : 'monthly',
        row.type === 'post' ? 0.8 : 0.6,
      ),
    )
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries,
    `</urlset>`,
  ].join('\n')
}

function urlEntry(
  loc: string,
  lastmod?: string,
  changefreq?: string,
  priority?: number,
): string {
  const parts = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`]
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority !== undefined) parts.push(`    <priority>${priority.toFixed(1)}</priority>`)
  parts.push(`  </url>`)
  return parts.join('\n')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const siteId = process.env.PUBLIC_SITE_ID
  const baseUrl = process.env.PUBLIC_BASE_URL ?? `https://${req.headers.host}`

  if (!siteId) {
    res.status(500).send('PUBLIC_SITE_ID not configured')
    return
  }

  try {
    const xml = await generateSitemap(siteId, baseUrl)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.status(200).send(xml)
  } catch (err) {
    res.status(500).send('Failed to generate sitemap')
  }
}
