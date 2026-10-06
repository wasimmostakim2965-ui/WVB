import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useConsent } from '@/lib/consent'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
    __ADSENSE_CLIENT__?: string
  }
}

interface AdSlotProps {
  /** AdSense ad unit id, e.g. "1234567890". */
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle'
  layout?: string
  className?: string
  /** Visual height reserved before the ad loads, prevents layout shift. */
  minHeight?: number
  label?: string
}

/**
 * AdSense-ready placement. It renders only when a publisher id and an ad unit id
 * are configured *and* the visitor has accepted advertising cookies; otherwise it
 * renders nothing, so the layout stays clean and no request is made before consent.
 */
export function AdSlot({
  slot,
  format = 'auto',
  layout,
  className,
  minHeight = 120,
  label = 'Advertisement',
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null)
  const consent = useConsent()
  const client = typeof window !== 'undefined' ? window.__ADSENSE_CLIENT__ : undefined
  const configured = Boolean(client && slot && !client.includes('XXXX')) && consent === 'accepted'

  useEffect(() => {
    if (!configured) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* ad blocker or script not loaded yet */
    }
  }, [configured])

  // Until ads are configured and consented to, render nothing.
  if (!configured) return null

  return (
    <aside aria-label={label} className={cn('w-full', className)} data-ad-slot={slot}>
      <div className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-mute/60">
        {label}
      </div>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive="true"
      />
    </aside>
  )
}
