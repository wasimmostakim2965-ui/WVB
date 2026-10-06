import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TOOLS, type ToolMeta } from '@/data/tools'
import { AdSlot } from '@/components/ui/AdSlot'
import { useSeo, breadcrumbLd, softwareAppLd, SITE } from '@/lib/seo'

interface ToolShellProps {
  tool: ToolMeta
  children: ReactNode
  /** Slot id for the in-article ad unit. */
  adSlot?: string
}

export function ToolShell({ tool, children, adSlot }: ToolShellProps) {
  const path = `/${tool.slug}`
  const title = `${tool.name} — Free Online Tool | ${SITE.name}`

  useSeo({
    title,
    description: tool.short,
    path,
    keywords: tool.keywords,
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

  const related = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .concat(TOOLS.filter((t) => t.category !== tool.category))
    .slice(0, 4)

  return (
    <div className="pb-4">
      <div className="shell pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-ink-mute">
          <Link to="/" className="hover:text-brand-700">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/tools" className="hover:text-brand-700">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-ink-soft">{tool.name}</span>
        </nav>

        <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <tool.icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-[32px]">
                {tool.name}
              </h1>
              <p className="mt-1.5 max-w-2xl text-[15px] leading-7 text-ink-mute">{tool.short}</p>
            </div>
          </div>
          <span className="chip shrink-0 self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Runs in your browser
          </span>
        </header>
      </div>

      <div className="shell mt-7">
        <AdSlot slot={adSlot} minHeight={90} className="mb-7" />
        {children}

        <AdSlot slot={adSlot} minHeight={250} className="mt-10" />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <Link
                key={t.slug}
                to={`/${t.slug}`}
                className="card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <t.icon className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-bold text-ink group-hover:text-brand-700">
                  {t.name}
                </span>
                <span className="text-xs leading-5 text-ink-mute">{t.short}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
