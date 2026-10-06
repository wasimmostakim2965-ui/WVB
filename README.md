# WVB Tools

A suite of 19 free, privacy-first web tools that run entirely in the browser — image
conversion and resizing, background removal, PDF merge/split/compress, QR codes, a
speed test, calculators, text tools and more. No accounts, no uploads, no tracking
before consent.

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
  pages/               Route-level pages (Home, ToolsIndex, ToolPage, legal pages)
  components/          Layout (Header, Footer, ToolShell) and UI (ToolCard, AdSlot)
  tools/               One component per tool, lazily loaded by ToolPage
  lib/                 Shared helpers (seo, consent, qr, cn)
public/                Static assets, robots.txt, sitemap.xml, ads.txt
vercel.json            SPA rewrite + security/cache headers
```

Adding a tool means: create `src/tools/MyTool.tsx`, register it in `src/data/tools.ts`
and map it in `src/pages/ToolPage.tsx`. The homepage grid, search and header menu all
read from the registry.

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

## Enabling ads (AdSense)

The site ships with **no live ad code**. Ad units render nothing until a real
publisher ID is set, and the AdSense script is injected only after a visitor accepts
advertising cookies.

1. Replace the placeholder in `index.html`:
   `window.__ADSENSE_CLIENT__ = 'ca-pub-XXXXXXXXXXXXXXXX'` → your `ca-pub-…` id.
2. Replace the placeholder publisher line in `public/ads.txt` with your own.
3. Set the `slot` prop of each `AdSlot` to the ad-unit id from AdSense.

Until step 1 is done, `AdSlot` returns `null`, so the layout stays clean.

## Privacy notes

Files are processed on the visitor's device wherever the browser allows it. A few
tools call a third-party service for data they cannot compute locally — ipwho.is
(IP lookup), Cloudflare's speed-test endpoint, open.er-api.com (exchange rates) and
YouTube's image CDN (thumbnails). These are listed in the Privacy Policy.

## License

Released for public use by WVB Tools. Third-party dependencies keep their own
licenses.
