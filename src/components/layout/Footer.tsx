import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { CATEGORIES, TOOLS } from '@/data/tools'

const LEGAL = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/cookie-policy', label: 'Cookie Policy' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-surface-line bg-surface-muted/40">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white">
              <Sparkles className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              WVB<span className="text-brand-600">Tools</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-mute">
            Twenty fast, private tools that run entirely in your browser. No account, no upload,
            no cost.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">Popular tools</h3>
          <ul className="space-y-2 text-sm">
            {TOOLS.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link to={`/${t.slug}`} className="text-ink-mute transition hover:text-brand-700">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">Categories</h3>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  to={`/tools#${c.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                  className="text-ink-mute transition hover:text-brand-700"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-ink-mute transition hover:text-brand-700">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-ink-mute transition hover:text-brand-700">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/tools" className="text-ink-mute transition hover:text-brand-700">
                All tools
              </Link>
            </li>
            {LEGAL.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ink-mute transition hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-surface-line">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-mute sm:flex-row">
          <p>© {year} WVB Tools. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Files are processed on your device.</span>
            <Link to="/privacy-policy" className="hover:text-brand-700">
              Your privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
