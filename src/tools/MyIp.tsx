import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Globe, RefreshCw, ShieldCheck } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { CopyButton, Notice, Panel, Stat, Spinner } from '@/components/ui/Primitives'

interface IpInfo {
  ip: string
  type: string
  country: string
  country_code: string
  region: string
  city: string
  postal: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  org: string
  asn: string
  continent: string
  flag?: string
}

function detectProxy(ua: string, isp: string, org: string): { level: 'low' | 'medium' | 'high'; note: string } {
  const haystack = `${isp} ${org}`.toLowerCase()
  const datacenter =
    /(amazon|aws|google|microsoft|azure|digitalocean|linode|ovh|hetzner|vultr|cloudflare|oracle|m247|leaseweb|contabo)/.test(
      haystack,
    )
  const headless = /headless|bot|curl|wget|python-requests|phantom/i.test(ua)
  if (datacenter)
    return {
      level: 'high',
      note: 'Your connection comes from a hosting provider, which is typical of a VPN, proxy or cloud server.',
    }
  if (headless)
    return { level: 'medium', note: 'Your browser identifies itself as an automated client.' }
  return {
    level: 'low',
    note: 'No obvious VPN or proxy signals were found. Your address looks like a normal residential or mobile connection.',
  }
}

export default function MyIp({ tool }: { tool: ToolMeta }) {
  const [info, setInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://ipwho.is/', { cache: 'no-store' })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Lookup failed')
      setInfo({
        ip: data.ip,
        type: data.type,
        country: data.country,
        country_code: data.country_code,
        region: data.region,
        city: data.city,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone?.id ?? '',
        isp: data.connection?.isp ?? 'Unknown',
        org: data.connection?.org ?? 'Unknown',
        asn: data.connection?.asn ? `AS${data.connection.asn}` : '—',
        continent: data.continent,
        flag: data.flag?.emoji,
      })
    } catch (e) {
      setError(
        (e as Error).message ||
          'Could not reach the IP lookup service. A network filter or ad blocker may be blocking it.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const proxy = info ? detectProxy(navigator.userAgent, info.isp, info.org) : null
  const mapSrc = info
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${info.longitude - 0.2}%2C${
        info.latitude - 0.15
      }%2C${info.longitude + 0.2}%2C${info.latitude + 0.15}&layer=mapnik&marker=${info.latitude}%2C${info.longitude}`
    : ''

  return (
    <ToolShell
      tool={tool}
    >
      <Panel
        title="Your public IP address"
        actions={
          <button type="button" className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      >
        {loading && !info ? (
          <div className="py-10 text-center">
            <Spinner label="Looking up your address…" />
          </div>
        ) : error ? (
          <Notice tone="error">{error}</Notice>
        ) : info ? (
          <>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
                    {info.ip}
                  </span>
                  <span className="chip">{info.type}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-mute">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    {info.flag} {info.city}, {info.region}, {info.country}
                  </span>
                </div>
              </div>
              <CopyButton value={info.ip} label="Copy IP" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="ISP" value={<span className="text-base">{info.isp}</span>} />
              <Stat label="ASN" value={<span className="text-base">{info.asn}</span>} />
              <Stat label="Timezone" value={<span className="text-base">{info.timezone || '—'}</span>} />
              <Stat label="Postal" value={<span className="text-base">{info.postal || '—'}</span>} />
            </div>
          </>
        ) : null}
      </Panel>

      {info && proxy && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel title="Connection safety">
            <div className="flex items-start gap-3">
              <span
                className={
                  proxy.level === 'low'
                    ? 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600'
                    : 'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600'
                }
              >
                {proxy.level === 'low' ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </span>
              <div>
                <div className="text-sm font-bold text-ink">
                  {proxy.level === 'low' ? 'No VPN detected' : 'Possible VPN or proxy'}
                </div>
                <p className="mt-1 text-sm leading-6 text-ink-mute">{proxy.note}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Organisation" value={<span className="text-sm">{info.org}</span>} />
              <Stat label="Continent" value={<span className="text-sm">{info.continent}</span>} />
            </div>
          </Panel>

          <Panel title="Approximate location" description="Approximate area, not an exact address">
            <div className="overflow-hidden rounded-xl border border-surface-line">
              <iframe
                title="Approximate location map"
                src={mapSrc}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Latitude {info.latitude.toFixed(4)}, longitude {info.longitude.toFixed(4)}
              </span>
            </div>
          </Panel>
        </div>
      )}

      <Panel className="mt-5" title="Your browser details">
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            { k: 'User agent', v: navigator.userAgent },
            { k: 'Platform', v: navigator.platform || '—' },
            { k: 'Language', v: navigator.language },
            { k: 'Screen', v: `${window.screen.width} × ${window.screen.height}` },
            { k: 'Viewport', v: `${window.innerWidth} × ${window.innerHeight}` },
            { k: 'Time zone', v: Intl.DateTimeFormat().resolvedOptions().timeZone },
            { k: 'CPU threads', v: String(navigator.hardwareConcurrency || '—') },
            { k: 'Touch support', v: 'ontouchstart' in window ? 'Yes' : 'No' },
          ].map((row) => (
            <div key={row.k} className="rounded-xl border border-surface-line px-3 py-2">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">{row.k}</dt>
              <dd className="mt-0.5 break-words font-mono text-xs text-ink-soft">{row.v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </ToolShell>
  )
}
