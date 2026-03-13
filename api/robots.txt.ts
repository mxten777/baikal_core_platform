// ============================================================
// api/robots.txt — Vercel Serverless Function
//
// 책임: robots.txt 동적 생성 (환경별 diff — production vs staging)
//
// vercel.json 에서 /robots.txt → /api/robots.txt 로 rewrite 설정 필요.
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host ?? ''
  const baseUrl = process.env.PUBLIC_BASE_URL ?? `https://${host}`
  const isProduction = process.env.VERCEL_ENV === 'production'

  const content = isProduction
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    : [
        '# Non-production environment — blocking all crawlers',
        'User-agent: *',
        'Disallow: /',
      ].join('\n')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=86400')
  res.status(200).send(content)
}
