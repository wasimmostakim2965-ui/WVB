import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { CATEGORIES, TOOLS, POPULAR_TOOLS, type Category } from '@/data/tools'
import { useSeo, SITE, faqLd, websiteLd } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { AdSlot } from '@/components/ui/AdSlot'
import { AD_UNITS } from '@/lib/ads'
import { ToolCard } from '@/components/ui/ToolCard'

const HIGHLIGHTS = [
  {
    title: 'Private by design',
    body: 'Wherever the browser allows it, files are processed on your own device and are never uploaded to us.',
  },
  {
    title: 'No account, no waiting',
    body: 'Every tool opens instantly. There is no sign-up, no email address and no server round-trip.',
  },
  {
    title: 'Free to use',
    body: 'The suite is free and supported by advertising, which keeps every tool open to everyone.',
  },
]

const DIRECTORY_FAQ = [
  {
    q: 'Are these online tools really free?',
    a: 'Yes. Every tool on WVB Tools is free to use with no account, no trial and no hidden charge. The site is supported by advertising.',
  },
  {
    q: 'Do you upload my files to a server?',
    a: 'No. The image, PDF, document, text and media tools run inside your browser, so your files stay on your device. A few tools contact a public third-party service for data they cannot compute locally, and those are listed in our Privacy Policy.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No installation is needed. Each tool is a web page that works in any current version of Chrome, Edge, Firefox or Safari.',
  },
  {
    q: 'Can I use these tools on my phone?',
    a: 'Yes. Every tool is responsive and works on modern mobile browsers as well as on desktop.',
  },
]

const categorySlug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, '-')

export default function ToolsDirectory() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const catParam = params.get('cat')
  const active: Category | 'All' = CATEGORIES.find((c) => categorySlug(c) === catParam) ?? 'All'

  const setQuery = (value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true },
    )

  const setActive = (c: Category | 'All') =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (c === 'All') next.delete('cat')
        else next.set('cat', categorySlug(c))
        return next
      },
      { replace: true },
    )

  useSeo({
    title: `${SITE.name} — 19 Free Online Tools for Images, PDF, Text & More`,
    description:
      'Browse all 19 free online tools: image converter, PDF merge and split, background remover, QR code generator, speed test, word counter, calculators and more. No sign-up, all private.',
    path: '/',
    keywords: [
      'free online tools',
      'online tools list',
      'image converter',
      'pdf tools',
      'background remover',
      'qr code generator',
      'speed test',
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        websiteLd(),
        { '@type': 'CollectionPage', name: 'All Tools', url: SITE.domain },
        {
          '@type': 'ItemList',
          itemListElement: TOOLS.map((tool, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: tool.name,
            url: `${SITE.domain}/${tool.slug}`,
          })),
        },
        faqLd(DIRECTORY_FAQ),
      ],
    },
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLS.filter((t) => {
      const matchesCat = active === 'All' || t.category === active
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      return matchesCat && matchesQuery
    })
  }, [query, active])

  return (
    <div className="shell py-10">
      <header className="max-w-2xl">
        <span className="chip">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          19 tools · run in your browser
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          All tools
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-mute">
          Nineteen focused utilities for images, PDFs, text, network checks and everyday
          calculations. Pick a tool to start — everything runs privately in your browser, with no
          account and no upload.
        </p>
      </header>

      <div className="mt-7 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="field pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition',
                active === c
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-surface-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <AdSlot slot={AD_UNITS.toolsTop} minHeight={90} className="mt-8" />

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-mute">
          No tools match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      <section className="mt-14">
        <div className="mb-5 flex items-center gap-2.5">
          <h2 className="font-display text-xl font-bold text-ink">Most used tools</h2>
          <span className="chip">Popular</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-surface-line bg-surface-muted/50 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">About these tools</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-ink-soft">
          WVB Tools is an independent collection of {TOOLS.length} everyday web utilities. We built
          it because the simplest tasks — converting a photo, merging two PDFs, checking an IP
          address or counting words — are often buried behind sign-up walls, upload limits and
          cluttered pages. Every tool here opens instantly, works on desktop and mobile, and keeps
          your files on your own device wherever the browser makes that possible.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="card p-4">
              <dt className="font-display text-sm font-bold text-ink">{h.title}</dt>
              <dd className="mt-1.5 text-[13px] leading-6 text-ink-mute">{h.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[14px] leading-7 text-ink-soft">
          The suite covers eight areas: image and media, PDF and documents, developer tools, design
          and colour, network and security, text and audio, calculators, and time and utilities.
          Found a bug or have an idea for a tool we should add? We would like to hear from you —{' '}
          <Link to="/contact">get in touch</Link>.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-ink">Frequently asked questions</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {DIRECTORY_FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-surface-line bg-surface-muted/40 p-4">
              <dt className="font-display text-[15px] font-bold text-ink">{item.q}</dt>
              <dd className="mt-1.5 text-[14px] leading-6 text-ink-soft">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 text-[13px] text-ink-mute">
        Page last reviewed {SITE.updated}.{' '}
        <Link to="/about" className="font-semibold text-brand-700 hover:text-brand-800">
          Learn more about WVB Tools <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </p>
    </div>
  )
}
