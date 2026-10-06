import { useEffect } from 'react'
import { SITE, type SeoOptions } from './seoData'

export {
  SITE,
  breadcrumbLd,
  softwareAppLd,
  faqLd,
  toolPath,
  toolTitle,
  toolMetaDescription,
  DEFAULT_TITLE,
  type SeoOptions,
} from './seoData'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Keeps the document head in sync with the current route: title, description,
 * canonical, social tags and structured data. The same values are written into
 * the static HTML at build time, so crawlers see them without running scripts.
 */
export function useSeo({ title, description, path, keywords, type = 'website', jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE.domain}${path}`
    document.title = title

    upsertMeta('name', 'description', description)
    if (keywords?.length) upsertMeta('name', 'keywords', keywords.join(', '))
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')

    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', SITE.name)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)

    upsertLink('canonical', url)

    // Replace any structured data already in the document (including the block
    // prerendered into the static HTML) so exactly one graph is present.
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove())

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-seo', 'dynamic')
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      if (script) script.remove()
    }
  }, [title, description, path, keywords, type, jsonLd])
}
