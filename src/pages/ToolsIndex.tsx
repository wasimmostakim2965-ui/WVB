import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { CATEGORIES, TOOLS, type Category } from '@/data/tools'
import { useSeo, SITE, breadcrumbLd } from '@/lib/seo'
import { cn } from '@/lib/cn'
import { AdSlot } from '@/components/ui/AdSlot'

export default function ToolsIndex() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Category | 'All'>('All')

  useSeo({
    title: `All Tools — Free Online Utilities | ${SITE.name}`,
    description:
      'Browse all 20 free online tools: image converter, PDF editor, QR code generator, speed test, word counter, calculators and more. No sign-up, all private.',
    path: '/tools',
    keywords: ['online tools list', 'free web tools', 'browser utilities'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'All Tools',
          url: `${SITE.domain}/tools`,
        },
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
        ]),
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
    <div className="shell py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          All tools
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-mute">
          Twenty focused utilities that run in your browser. Search below or filter by category to
          find what you need.
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

      <AdSlot slot="tools-top" minHeight={90} className="mt-8" />

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-ink-mute">
          No tools match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-ink transition group-hover:bg-brand-50 group-hover:text-brand-700">
                  <tool.icon className="h-5.5 w-5.5" strokeWidth={2} />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-mute opacity-0 transition group-hover:opacity-100" />
              </div>
              <h2 className="font-display text-[15px] font-bold text-ink group-hover:text-brand-700">
                {tool.name}
              </h2>
              <p className="text-[13px] leading-6 text-ink-mute">{tool.short}</p>
              <span className="mt-auto pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-mute/70">
                {tool.category}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
