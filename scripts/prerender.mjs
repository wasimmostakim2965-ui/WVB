/**
 * Post-build step.
 *
 * A single-page app ships one index.html for every route, which means search
 * engines see the same title and the same (empty) body for all 27 pages. This
 * script gives each route its own static HTML file in `dist/` with the correct
 * title, description, canonical, social tags and structured data already in the
 * markup — no JavaScript required — plus a real <noscript> summary of the page.
 *
 * Vercel serves static files before applying rewrites, so these per-route files
 * are served as-is while the app still takes over in the browser.
 *
 * It also regenerates `dist/sitemap.xml` from the same source of truth.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

async function loadData() {
  const result = await build({
    entryPoints: [join(root, 'scripts/seo-entry.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    logLevel: 'silent',
  })
  const outfile = join(root, 'node_modules/.cache/seo-entry.mjs')
  await mkdir(dirname(outfile), { recursive: true })
  await writeFile(outfile, result.outputFiles[0].text)
  return import(outfile)
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function buildHead(meta) {
  const url = meta.path === '/' ? '/' : meta.path
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.keywords?.length ? `<meta name="keywords" content="${esc(meta.keywords.join(', '))}" />` : '',
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${esc(meta.domain)}${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="WVB Tools" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.domain)}${esc(url)}" />`,
  ]
  if (meta.jsonLd) {
    tags.push(
      `<script type="application/ld+json" data-seo="static">${JSON.stringify(meta.jsonLd)}</script>`,
    )
  }
  return tags.filter(Boolean).join('\n    ')
}

/** Remove the template's fallback SEO tags so each page has exactly one of each. */
function stripSeoTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/g, '')
    .replace(/<meta\s+name="robots"[^>]*>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>/g, '')
}

/**
 * The AdSense verification <script> lives in index.html, so it is copied into
 * every generated page by the template. Here we only add the publisher meta tag
 * and the client id the runtime ad slots read. The publisher id defaults to the
 * account's real id and can be overridden with VITE_ADSENSE_CLIENT at build time.
 */
const ADSENSE_CLIENT = process.env.VITE_ADSENSE_CLIENT || 'ca-pub-1266781820950132'

function buildAdsenseTags() {
  if (!/^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT)) return ''
  return [
    `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}" />`,
    `<script>window.__ADSENSE_CLIENT__ = '${ADSENSE_CLIENT}'</script>`,
  ].join('\n    ')
}

/** A short, human-readable summary for crawlers and no-JS visitors. */
function buildNoscript(meta) {
  const lines = [`<h1>${esc(meta.title.split(' — ')[0])}</h1>`, `<p>${esc(meta.description)}</p>`]
  if (meta.intro) lines.push(`<p>${esc(meta.intro)}</p>`)
  if (meta.faq?.length) {
    lines.push('<h2>Frequently asked questions</h2>')
    for (const item of meta.faq) {
      lines.push(`<h3>${esc(item.q)}</h3>`, `<p>${esc(item.a)}</p>`)
    }
  }
  lines.push('<p><a href="/">Browse all free tools</a></p>')
  return lines.join('\n      ')
}

async function main() {
  const data = await loadData()
  const manifest = data.buildManifest()
  const template = await readFile(join(dist, 'index.html'), 'utf8')
  const adsense = buildAdsenseTags()

  if (!template.includes('<!--seo-->')) {
    throw new Error('dist/index.html is missing the <!--seo--> marker')
  }

  for (const meta of manifest) {
    const head = buildHead({ domain: data.SITE.domain, ...meta })
    const base = stripSeoTags(template)
    let html = base.replace('<!--seo-->', `${head}\n    ${adsense}`)
    html = html.replace('<!--noscript-->', buildNoscript(meta))

    const outFile = meta.path === '/' ? join(dist, 'index.html') : join(dist, `${meta.path.slice(1)}.html`)
    await mkdir(dirname(outFile), { recursive: true })
    await writeFile(outFile, html)

    // Emit the directory/index.html form too, so both URL styles resolve to the
    // same prerendered document regardless of Vercel's clean-url handling.
    if (meta.path !== '/') {
      const dirIndex = join(dist, meta.path.slice(1), 'index.html')
      await mkdir(dirname(dirIndex), { recursive: true })
      await writeFile(dirIndex, html)
    }
  }

  // A dedicated 404 document. Vercel serves this for any unknown path.
  const notFound = stripSeoTags(template)
    .replace(
      '<!--seo-->',
      '<title>Page not found | WVB Tools</title>\n    <meta name="robots" content="noindex, follow" />',
    )
    .replace('<!--noscript-->', '<h1>Page not found</h1>\n      <p><a href="/">Go to the homepage</a></p>')
  await writeFile(join(dist, '404.html'), notFound)

  // ads.txt: emit the real seller line so AdSense can verify the site.
  if (/^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT)) {
    const pub = ADSENSE_CLIENT.replace(/^ca-/, '')
    await writeFile(join(dist, 'ads.txt'), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`)
  }

  // Sitemap from the same source of truth.
  const urls = manifest
    .map(
      (m) => `  <url>
    <loc>${data.SITE.domain}${m.path}</loc>
    <lastmod>${data.SITE.lastmod}</lastmod>
    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
  </url>`,
    )
    .join('\n')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  await writeFile(join(dist, 'sitemap.xml'), sitemap)

  console.log(`prerendered ${manifest.length} routes + 404.html + sitemap.xml`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
