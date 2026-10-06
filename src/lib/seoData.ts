/**
 * Pure SEO helpers shared by the running app (`useSeo`) and the build-time
 * prerender script. Everything here is plain data and strings: no React, no DOM.
 */
import { TOOLS } from '../data/catalog'

export const SITE = {
  name: 'WVB Tools',
  domain: 'https://wvbtools.com',
  tagline: '19 free online tools that run in your browser',
  twitter: '@wvbtools',
  email: 'hello@wvbtools.com',
  updated: 'October 5, 2026',
  lastmod: '2026-10-05',
}

export interface SeoOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | null
}

export interface PageMeta {
  title: string
  description: string
  path: string
  keywords?: string[]
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | null
}

export const DEFAULT_TITLE = `${SITE.name} — 19 Free Online Tools for Images, PDF, Text & More`

export function toolPath(slug: string) {
  return `/${slug}`
}

export function toolTitle(name: string) {
  return `${name} — Free Online Tool | ${SITE.name}`
}

export function toolMetaDescription(_slug: string, short: string, keywords: string[]): string {
  const kw = keywords.slice(0, 3).join(', ')
  return `${short} ${kw ? `Works with ${kw}.` : ''} Free, private and runs in your browser — no sign-up.`
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.domain}${item.path}`,
    })),
  }
}

export function softwareAppLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url: `${SITE.domain}${path}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/**
 * A small, self-contained XML serializer for the JSON-LD blocks in the
 * prerendered HTML. Keeps the build script free of extra dependencies.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
}

/** Every indexable static page, used for the sitemap and the prerender pass. */
export interface StaticRoute {
  path: string
  title: string
  description: string
  keywords?: string[]
  priority: string
  changefreq: string
}

export const STATIC_ROUTES: StaticRoute[] = [
  {
    path: '/',
    title: DEFAULT_TITLE,
    description:
      'Free, fast, private online tools that run in your browser. Convert images, merge and split PDFs, remove backgrounds, generate QR codes, test your speed and more. No sign-up.',
    keywords: ['free online tools', 'image converter', 'pdf tools', 'background remover', 'qr code generator', 'speed test'],
    priority: '1.0',
    changefreq: 'weekly',
  },
  {
    path: '/tools',
    title: `All Tools — Free Online Utilities | ${SITE.name}`,
    description:
      'Browse all 19 free online tools: image converter, PDF editor, background remover, QR code generator, speed test, word counter, calculators and more. No sign-up, all private.',
    keywords: ['online tools list', 'free web tools', 'browser utilities'],
    priority: '0.9',
    changefreq: 'weekly',
  },
  {
    path: '/about',
    title: `About Us | ${SITE.name}`,
    description:
      'Learn who builds WVB Tools, why every tool runs privately in your browser, and how the site stays free.',
    priority: '0.5',
    changefreq: 'monthly',
  },
  {
    path: '/contact',
    title: `Contact Us | ${SITE.name}`,
    description:
      'Get in touch with the WVB Tools team for support, feedback, bug reports or business enquiries.',
    priority: '0.5',
    changefreq: 'monthly',
  },
  {
    path: '/privacy-policy',
    title: `Privacy Policy | ${SITE.name}`,
    description:
      'How WVB Tools handles your data. Our tools run in your browser and do not upload your files. Learn about cookies, analytics and advertising.',
    priority: '0.3',
    changefreq: 'yearly',
  },
  {
    path: '/terms',
    title: `Terms of Service | ${SITE.name}`,
    description: 'The terms that govern your use of the WVB Tools website and its free online tools.',
    priority: '0.3',
    changefreq: 'yearly',
  },
  {
    path: '/disclaimer',
    title: `Disclaimer | ${SITE.name}`,
    description:
      'Important information about the accuracy and appropriate use of the results produced by WVB Tools.',
    priority: '0.3',
    changefreq: 'yearly',
  },
  {
    path: '/cookie-policy',
    title: `Cookie Policy | ${SITE.name}`,
    description:
      'What cookies and local storage WVB Tools uses, why we use them, and how to control them.',
    priority: '0.3',
    changefreq: 'yearly',
  },
]

export interface RouteMeta extends PageMeta {
  priority: string
  changefreq: string
  jsonLd: Record<string, unknown> | null
}

/** Full metadata for every indexable route: static pages plus every tool. */
export function buildRouteManifest(): RouteMeta[] {
  const routes: RouteMeta[] = STATIC_ROUTES.map((r) => ({
    title: r.title,
    description: r.description,
    path: r.path,
    keywords: r.keywords,
    priority: r.priority,
    changefreq: r.changefreq,
    jsonLd:
      r.path === '/'
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE.name,
            url: SITE.domain,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE.domain}/tools?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }
        : null,
  }))

  for (const tool of TOOLS) {
    const path = toolPath(tool.slug)
    routes.push({
      title: toolTitle(tool.name),
      description: toolMetaDescription(tool.slug, tool.short, tool.keywords),
      path,
      keywords: tool.keywords,
      priority: '0.8',
      changefreq: 'monthly',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          softwareAppLd(tool.name, tool.short, path),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: tool.name, path },
          ]),
        ],
      },
    })
  }

  return routes
}
