import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'
import { AD_UNITS } from '@/lib/ads'

export function LegalPage({
  title,
  description,
  path,
  updated,
  children,
}: {
  title: string
  description: string
  path: string
  updated: string
  children: ReactNode
}) {
  useSeo({ title: `${title} | ${SITE.name}`, description, path })
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-ink-mute">Last updated: {updated}</p>
        <div className="prose-wvb mt-8">{children}</div>

        <div className="mt-12 rounded-2xl border border-surface-line bg-surface-muted/40 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Questions about this page?</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Contact us at <strong>{SITE.email}</strong> or use our{" "}
            <Link to="/contact" className="font-semibold text-brand-700 underline">
              contact form
            </Link>
            . For more detail on how we handle data, see the{" "}
            <Link to="/privacy-policy" className="font-semibold text-brand-700 underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/cookie-policy" className="font-semibold text-brand-700 underline">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <AdSlot slot={AD_UNITS.legalBottom} minHeight={250} className="mt-12" />
      </div>
    </div>
  )
}
