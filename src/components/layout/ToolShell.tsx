import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, ShieldCheck } from 'lucide-react'
import { TOOLS, type ToolMeta } from '@/data/tools'
import { getToolContent } from '@/data/toolContent'
import { AdSlot } from '@/components/ui/AdSlot'
import { AD_UNITS } from '@/lib/ads'
import {
  useSeo,
  breadcrumbLd,
  softwareAppLd,
  faqLd,
  toolMetaDescription,
  toolTitle,
  SITE,
} from '@/lib/seo'

interface ToolShellProps {
  tool: ToolMeta
  children: ReactNode
}

export function ToolShell({ tool, children }: ToolShellProps) {
  const path = `/${tool.slug}`
  const content = getToolContent(tool.slug)
  const title = toolTitle(tool.name)
  const description = toolMetaDescription(tool.slug, tool.short, tool.keywords)

  useSeo({
    title,
    description,
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
        ...(content ? [faqLd(content.faq)] : []),
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
              <p className="mt-1.5 max-w-2xl text-[15px] leading-7 text-ink-mute">
                {content?.intro ?? tool.description}
              </p>
            </div>
          </div>
          <span className="chip shrink-0 self-start">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Private — runs in your browser
          </span>
        </header>
      </div>

      {/* The tool itself, rendered and used entirely in the visitor's browser. */}
      <div className="shell mt-7">{children}</div>

      {content && (
        <div className="shell mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="prose-wvb max-w-none">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}

            <h2>Frequently asked questions</h2>
            <dl className="not-prose mt-4 space-y-4">
              {content.faq.map((item) => (
                <div key={item.q} className="rounded-xl border border-surface-line bg-surface-muted/40 p-4">
                  <dt className="font-display text-[15px] font-bold text-ink">{item.q}</dt>
                  <dd className="mt-1.5 text-[14px] leading-6 text-ink-soft">{item.a}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-[13px] text-ink-mute">
              Page last reviewed {SITE.updated}. Spotted a mistake?{' '}
              <Link to="/contact">Tell us</Link>.
            </p>
          </article>

          <aside className="space-y-5">
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-ink">What you get</h2>
              <ul className="mt-3 space-y-2.5">
                {content.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-[13px] leading-6 text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card bg-brand-50/60 p-5">
              <h2 className="font-display text-base font-bold text-ink">Your privacy</h2>
              <p className="mt-2 text-[13px] leading-6 text-ink-soft">
                This tool runs on your device. Files and text you use here are not uploaded to us. See
                our{' '}
                <Link to="/privacy-policy" className="font-semibold text-brand-700 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <AdSlot slot={AD_UNITS.toolSidebar} minHeight={250} />
          </aside>
        </div>
      )}

      <div className="shell mt-14">
        <section>
          <h2 className="font-display text-xl font-bold text-ink">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <Link
                key={t.slug}
                to={`/${t.slug}`}
                className="card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <t.icon className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-bold text-ink group-hover:text-brand-700">{t.name}</span>
                <span className="text-xs leading-5 text-ink-mute">{t.short}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
