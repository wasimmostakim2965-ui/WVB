import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { TOOLS, POPULAR_TOOLS, toolsByCategory } from '@/data/tools'
import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'
import { ToolCard } from '@/components/ui/ToolCard'

export default function Home() {
  useSeo({
    title: `${SITE.name} — 19 Free Online Tools for Images, PDF, Text & More`,
    description:
      'Free, fast, private online tools that run in your browser. Convert images, merge and split PDFs, remove backgrounds, generate QR codes, test your speed and 13 more tools. No sign-up.',
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
    <div className="shell py-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            19 free tools, right in your browser
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-mute">
            Pick a tool below. No sign-up, nothing to install, and your files never leave your device.
          </p>
        </div>
        <Link to="/tools" className="btn-ghost shrink-0 self-start sm:self-auto">
          <Search className="h-4 w-4" /> Search all tools
        </Link>
      </header>

      {/* Popular tools */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">Popular tools</h2>
          <span className="chip">Most used</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {POPULAR_TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <AdSlot slot="home-top" minHeight={90} className="my-10" />

      {/* All tools, grouped by category */}
      {groups.map((group) => (
        <section key={group.category} id={group.category.toLowerCase().replace(/[^a-z]+/g, '-')} className="mt-10 scroll-mt-24">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-surface-line pb-2">
            <h2 className="font-display text-lg font-bold text-ink">{group.category}</h2>
            <span className="text-xs font-semibold text-ink-mute">{group.tools.length} tools</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {group.tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12 rounded-2xl border border-surface-line bg-surface-muted/50 p-6">
        <h2 className="font-display text-lg font-bold text-ink">About these tools</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-7 text-ink-mute">
          WVB Tools is a free collection of {TOOLS.length} everyday utilities. Everything runs in your
          browser, so images, PDFs and text stay on your device and there is no account to create. The
          site is funded by advertising, which keeps every tool free.{' '}
          <Link to="/about" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2">
            Learn more
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
