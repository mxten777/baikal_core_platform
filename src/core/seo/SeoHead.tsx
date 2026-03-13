// ============================================================
// core/seo — SeoHead Component (react-helmet-async 기반)
// ============================================================

import { Helmet } from 'react-helmet-async'
import type { SeoMeta } from '@/types'

interface SeoHeadProps {
  meta: SeoMeta
}

export function SeoHead({ meta }: SeoHeadProps) {
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      {meta.noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={meta.ogTitle ?? meta.title} />
      <meta
        property="og:description"
        content={meta.ogDescription ?? meta.description}
      />
      {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}
      {meta.canonical && <meta property="og:url" content={meta.canonical} />}

      {/* JSON-LD */}
      {meta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structuredData)}
        </script>
      )}
    </Helmet>
  )
}
