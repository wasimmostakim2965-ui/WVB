import { SITE, buildRouteManifest } from '../src/lib/seoData'
import { getToolContent } from '../src/data/toolContent'

/** Plain-data manifest consumed by scripts/prerender.mjs at build time. */
export function buildManifest() {
  return buildRouteManifest().map((route) => {
    const slug = route.path === '/' ? '' : route.path.slice(1)
    const content = slug ? getToolContent(slug) : undefined
    return {
      ...route,
      intro: content?.intro,
      faq: content?.faq,
    }
  })
}

export { SITE }
