import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Sparkles, Zap, MonitorSmartphone } from 'lucide-react'
import { TOOLS, toolsByCategory } from '@/data/tools'
import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'

const STATS = [
  { icon: Sparkles, value: '20', label: 'Browser tools' },
  { icon: Lock, value: '0', label: 'Files uploaded' },
  { icon: Zap, value: 'Instant', label: 'No sign-up' },
  { icon: MonitorSmartphone, value: '100%', label: 'Free forever' },
]

export default function Home() {
  useSeo({
    title: `${SITE.name} — 20 Free Online Tools for Images, PDF, Text & More`,
    description:
      'Free, fast, private online tools that run in your browser. Convert images, edit PDFs, check your IP, test internet speed, generate QR codes and much more. No sign-up required.',
    path: '/',
    keywords: [
      'free online tools',
      'image converter',
      'pdf tools',
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
      <section className="relative overflow-hidden border-b border-surface-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(#eef0f4 1px, transparent 1px), linear-gradient(90deg, #eef0f4 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)',
          }}
        />
        <div className="shell relative py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-surface-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-card">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              No sign-up · No uploads · Works offline
            </span>
            <h1 className="mt-6 animate-fade-up text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
              Twenty sharp tools.
              <br />
              <span className="text-brand-600">One clean workspace.</span>
            </h1>
            <p className="mt-6 max-w-2xl animate-fade-up text-pretty text-lg leading-8 text-ink-mute">
              Convert images, merge PDFs, check your IP, test your speed, generate QR codes and
              more. Every tool runs inside your browser, so your files never leave your device.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3">
              <Link to="/tools" className="btn-primary px-5 py-3 text-[15px]">
                Explore all tools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/image-converter" className="btn-ghost px-5 py-3 text-[15px]">
                Try image converter
              </Link>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card p-4">
                <s.icon className="h-4.5 w-4.5 text-brand-600" />
                <dt className="mt-3 font-display text-2xl font-extrabold text-ink">{s.value}</dt>
                <dd className="text-xs font-medium text-ink-mute">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="shell">
        <AdSlot slot="home-top" minHeight={90} className="mt-10" />
      </div>

      {/* Tool grid */}
      <section id="tools" className="shell py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              All tools
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-mute">
              Pick a tool and get to work. Nothing to install, nothing to sign up for.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.slug}
              to={`/${tool.slug}`}
              className="card group relative flex flex-col gap-3 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-muted text-ink transition group-hover:bg-brand-50 group-hover:text-brand-700">
                  <tool.icon className="h-5.5 w-5.5" strokeWidth={2} />
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-surface-line text-ink-mute opacity-0 transition group-hover:border-brand-200 group-hover:text-brand-700 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div>
                <h3 className="font-display text-[15px] font-bold text-ink group-hover:text-brand-700">
                  {tool.name}
                </h3>
                <p className="mt-1 text-[13px] leading-6 text-ink-mute">{tool.short}</p>
              </div>
              <span className="mt-auto pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-mute/70">
                {tool.category}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories summary */}
      <section className="border-y border-surface-line bg-surface-muted/40">
        <div className="shell py-14">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Browse by category
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.category} className="card p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  {g.category}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {g.tools.map((t) => (
                    <li key={t.slug}>
                      <Link
                        to={`/${t.slug}`}
                        className="flex items-center gap-2 text-[13px] font-medium text-ink-mute transition hover:text-brand-700"
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / SEO content */}
      <section className="shell py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Tools that respect your privacy
          </h2>
          <div className="prose-wvb mt-5">
            <p>
              WVB Tools is a free collection of twenty everyday utilities for images, documents,
              text, network checks and calculations. Each one is built to do a single job well and
              to finish in seconds.
            </p>
            <p>
              Unlike most online converters, our image, PDF and file tools process everything{' '}
              <strong>locally in your browser</strong> using modern web technology. Your photos,
              documents and text are never uploaded to a server, which keeps your data private and
              makes the tools work even on a slow connection.
            </p>
            <p>
              There is no account to create and no software to install. Open a tool, do your task
              and move on. The site is supported by advertising, which is what keeps every tool
              free to use.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
