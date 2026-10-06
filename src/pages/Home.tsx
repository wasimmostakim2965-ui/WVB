import { Link } from 'react-router-dom'
import { ArrowRight, Gauge, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { TOOLS, POPULAR_TOOLS, toolsByCategory } from '@/data/tools'
import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'
import { AD_UNITS } from '@/lib/ads'
import { ToolCard } from '@/components/ui/ToolCard'

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Private by design', body: 'Files are processed on your device and never uploaded.' },
  { icon: Zap, title: 'Instant', body: 'No sign-up, no install, no waiting for a server round-trip.' },
  { icon: Gauge, title: 'Free forever', body: 'Every tool is free, supported by unobtrusive advertising.' },
]

export default function Home() {
  useSeo({
    title: `${SITE.name} — 19 Free Online Tools for Images, PDF, Text & More`,
    description:
      'Free, fast, private online tools that run in your browser. Convert images, merge and split PDFs, remove backgrounds, generate QR codes, test your speed and more. No sign-up.',
    path: '/',
    keywords: [
      'free online tools',
      'image converter',
      'pdf tools',
      'background remover',
      'qr code generator',
      'speed test',
      'word counter',
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.domain,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE.domain}/tools?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  })

  const groups = toolsByCategory()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-line bg-surface-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgba(31,63,224,0.10),transparent_60%)]"
        />
        <div className="shell relative py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="chip">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              19 tools · 100% browser-based
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              Every everyday web tool,
              <br className="hidden sm:block" /> in one clean place.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-ink-soft">
              Convert images, edit PDFs, remove backgrounds, generate QR codes, check your IP, test
              your connection and more. Everything runs privately in your browser — no account, no
              upload, no cost.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/tools" className="btn-primary">
                Browse all tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pdf-tools" className="btn-ghost">
                Try the PDF tools
              </Link>
            </div>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="card p-4">
                <h.icon className="h-5 w-5 text-brand-600" />
                <dt className="mt-2.5 font-display text-sm font-bold text-ink">{h.title}</dt>
                <dd className="mt-1 text-[13px] leading-6 text-ink-mute">{h.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="shell py-12">
        {/* Popular tools */}
        <section>
          <div className="mb-5 flex items-center gap-2.5">
            <h2 className="font-display text-xl font-bold text-ink">Popular tools</h2>
            <span className="chip">Most used</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TOOLS.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        <AdSlot slot={AD_UNITS.homeTop} minHeight={90} className="my-12" />

        {/* All tools by category */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">All tools by category</h2>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              <Search className="h-4 w-4" /> Search and filter
            </Link>
          </div>

          {groups.map((group) => (
            <div
              key={group.category}
              id={group.category.toLowerCase().replace(/[^a-z]+/g, '-')}
              className="mt-9 scroll-mt-24"
            >
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-surface-line pb-2">
                <h3 className="font-display text-base font-bold text-ink">{group.category}</h3>
                <span className="text-xs font-semibold text-ink-mute">{group.tools.length} tools</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-2xl border border-surface-line bg-surface-muted/50 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink">About these tools</h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-7 text-ink-soft">
            WVB Tools is a free collection of {TOOLS.length} everyday utilities. Everything runs in
            your browser, so images, PDFs and text stay on your device and there is no account to
            create. The site is funded by advertising, which keeps every tool free.{' '}
            <Link
              to="/about"
              className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2"
            >
              Learn more
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
