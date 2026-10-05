import type { ReactNode } from 'react'
import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'

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
        <AdSlot slot="legal-bottom" minHeight={250} className="mt-12" />
      </div>
    </div>
  )
}
