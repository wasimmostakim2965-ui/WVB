import { SITE, buildRouteManifest } from '../src/lib/seoData'
import { getToolContent } from '../src/data/toolContent'
import { TOOLS } from '../src/data/catalog'

/** Plain-data manifest consumed by scripts/prerender.mjs at build time. */
export function buildManifest() {
  return buildRouteManifest().map((route) => {
    const slug = route.path === '/' ? '' : route.path.slice(1)
    const content = slug ? getToolContent(slug) : undefined
    const tool = slug ? TOOLS.find((t) => t.slug === slug) : undefined
    return {
      ...route,
      intro: content?.intro,
      faq: content?.faq,
      // The home page carries a crawlable list of every tool so search engines
      // can discover each page from static HTML, without running JavaScript.
      tools: route.path === '/' ? TOOLS.map((t) => ({ slug: t.slug, name: t.name })) : undefined,
      // Each tool page links to its siblings in the same category, so crawlers
      // reach every tool from static HTML and users get related links.
      related: tool
        ? TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).map((t) => ({
            slug: t.slug,
            name: t.name,
          }))
        : undefined,
    }
  })
}

export { SITE }
