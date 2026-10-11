# WVB Tools

A suite of 19 free, privacy-first web tools that run entirely in the browser — image
conversion and resizing, background removal, PDF merge/split/compress, QR codes, a
speed test, calculators, text tools and more. No accounts, no uploads, no tracking.

Built with React 18, TypeScript, Vite and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # type-check + production bundle into dist/
npm run preview    # serve the production build locally
```

## Project layout

```
src/
  data/tools.ts        Tool registry: slug, name, category, icon, SEO copy
  pages/               Route-level pages (ToolsDirectory, ToolPage, legal pages)
  components/          Layout (Header, Footer, ToolShell) and UI (ToolCard, AdSlot)
  tools/               One component per tool, lazily loaded by ToolPage
  lib/                 Shared helpers (seo, seoData, ads, qr, cn)
public/                Static assets, robots.txt, ads.txt
scripts/prerender.mjs  Build-time prerender of every route + sitemap + 404
vercel.json            SPA rewrite + security/cache headers
```

Adding a tool means: create `src/tools/MyTool.tsx`, register it in `src/data/tools.ts`
and map it in `src/pages/ToolPage.tsx`. The directory grid, search and header menu all
read from the registry.

## SEO

Every route — the tool directory, the static pages and each of the 19 tools — is
prerendered to its own HTML file with a unique title, description, canonical URL and
JSON-LD, and listed in `sitemap.xml`. `npm run build` regenerates all of it.

## Deployment (Vercel)

`vercel.json` already sets the Vite framework, build command, output directory, SPA
rewrite and cache/security headers, so no dashboard configuration is required:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

Or import the repository at <https://vercel.com/new> — the settings are detected
automatically.

## Ads (AdSense)

The AdSense site-verification script for publisher `ca-pub-1266781820950132` sits in
the `<head>` of `index.html`, so it appears on every prerendered page, and `ads.txt`
holds the matching seller line. This is the code Google asks you to place in the
`<head>` of every page to connect the site to AdSense.

Ad units stay hidden until you give them ids. Set these in your Vercel project (or
`.env.local`) to switch a unit on:

```
VITE_ADSENSE_SLOT_TOOLS=0000000000
VITE_ADSENSE_SLOT_SIDEBAR=0000000000
```

To use a different publisher id, set `VITE_ADSENSE_CLIENT=ca-pub-…`; the build then
overrides the meta tag and `ads.txt`. Without a slot id, that `AdSlot` renders `null`
and no ad request is made.

## Privacy notes

Files are processed on the visitor's device wherever the browser allows it. A few
tools call a third-party service for data they cannot compute locally — ipwho.is
(IP lookup), Cloudflare's speed-test endpoint, open.er-api.com (exchange rates) and
YouTube's image CDN (thumbnails). These are listed in the Privacy Policy.

## License

Released for public use by WVB Tools. Third-party dependencies keep their own
licenses.
