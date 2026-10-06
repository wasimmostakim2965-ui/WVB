import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, Select, Stat, TextInput } from '@/components/ui/Primitives'
import { formatNumber } from '@/lib/format'

type Category = 'length' | 'weight' | 'temperature' | 'area' | 'speed' | 'data' | 'currency'

interface Unit {
  key: string
  label: string
  /** Factor to the category's base unit. */
  factor: number
}

const UNITS: Record<Exclude<Category, 'temperature' | 'currency'>, Unit[]> = {
  length: [
    { key: 'mm', label: 'Millimetre (mm)', factor: 0.001 },
    { key: 'cm', label: 'Centimetre (cm)', factor: 0.01 },
    { key: 'm', label: 'Metre (m)', factor: 1 },
    { key: 'km', label: 'Kilometre (km)', factor: 1000 },
    { key: 'in', label: 'Inch (in)', factor: 0.0254 },
    { key: 'ft', label: 'Foot (ft)', factor: 0.3048 },
    { key: 'yd', label: 'Yard (yd)', factor: 0.9144 },
    { key: 'mi', label: 'Mile (mi)', factor: 1609.344 },
    { key: 'nmi', label: 'Nautical mile', factor: 1852 },
  ],
  weight: [
    { key: 'mg', label: 'Milligram (mg)', factor: 1e-6 },
    { key: 'g', label: 'Gram (g)', factor: 0.001 },
    { key: 'kg', label: 'Kilogram (kg)', factor: 1 },
    { key: 't', label: 'Metric ton (t)', factor: 1000 },
    { key: 'oz', label: 'Ounce (oz)', factor: 0.0283495 },
    { key: 'lb', label: 'Pound (lb)', factor: 0.453592 },
    { key: 'st', label: 'Stone (st)', factor: 6.35029 },
  ],
  area: [
    { key: 'mm2', label: 'Square millimetre', factor: 1e-6 },
    { key: 'cm2', label: 'Square centimetre', factor: 1e-4 },
    { key: 'm2', label: 'Square metre', factor: 1 },
    { key: 'ha', label: 'Hectare', factor: 10000 },
    { key: 'km2', label: 'Square kilometre', factor: 1e6 },
    { key: 'ft2', label: 'Square foot', factor: 0.092903 },
    { key: 'ac', label: 'Acre', factor: 4046.86 },
    { key: 'mi2', label: 'Square mile', factor: 2589988 },
  ],
  speed: [
    { key: 'mps', label: 'Metre per second', factor: 1 },
    { key: 'kmh', label: 'Kilometre per hour', factor: 0.277778 },
    { key: 'mph', label: 'Mile per hour', factor: 0.44704 },
    { key: 'knot', label: 'Knot', factor: 0.514444 },
    { key: 'fts', label: 'Foot per second', factor: 0.3048 },
  ],
  data: [
    { key: 'B', label: 'Byte (B)', factor: 1 },
    { key: 'KB', label: 'Kilobyte (KB)', factor: 1024 },
    { key: 'MB', label: 'Megabyte (MB)', factor: 1024 ** 2 },
    { key: 'GB', label: 'Gigabyte (GB)', factor: 1024 ** 3 },
    { key: 'TB', label: 'Terabyte (TB)', factor: 1024 ** 4 },
    { key: 'PB', label: 'Petabyte (PB)', factor: 1024 ** 5 },
    { key: 'bit', label: 'Bit (b)', factor: 1 / 8 },
    { key: 'Kbit', label: 'Kilobit (Kb)', factor: 1024 / 8 },
    { key: 'Mbit', label: 'Megabit (Mb)', factor: 1024 ** 2 / 8 },
    { key: 'Gbit', label: 'Gigabit (Gb)', factor: 1024 ** 3 / 8 },
  ],
}

const TEMPS = [
  { key: 'C', label: 'Celsius (°C)' },
  { key: 'F', label: 'Fahrenheit (°F)' },
  { key: 'K', label: 'Kelvin (K)' },
]

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  BDT: 'Bangladeshi Taka',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  ZAR: 'South African Rand',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  SGD: 'Singapore Dollar',
  NZD: 'New Zealand Dollar',
  KRW: 'South Korean Won',
  TRY: 'Turkish Lira',
  RUB: 'Russian Ruble',
  PKR: 'Pakistani Rupee',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Peso',
  THB: 'Thai Baht',
  NGN: 'Nigerian Naira',
  EGP: 'Egyptian Pound',
}

function convertTemp(value: number, from: string, to: string): number {
  let celsius = value
  if (from === 'F') celsius = ((value - 32) * 5) / 9
  if (from === 'K') celsius = value - 273.15
  if (to === 'C') return celsius
  if (to === 'F') return (celsius * 9) / 5 + 32
  return celsius + 273.15
}

export default function UnitConverter({ tool }: { tool: ToolMeta }) {
  const [category, setCategory] = useState<Category>('length')
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('ft')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesDate, setRatesDate] = useState('')
  const [loadingRates, setLoadingRates] = useState(false)
  const [ratesError, setRatesError] = useState<string | null>(null)

  const loadRates = async () => {
    setLoadingRates(true)
    setRatesError(null)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' })
      const data = await res.json()
      if (data.result !== 'success') throw new Error('Rate service returned an error')
      setRates(data.rates)
      setRatesDate(data.time_last_update_utc ?? '')
    } catch (e) {
      setRatesError(
        (e as Error).message ||
          'Could not load exchange rates. Check your connection, or a filter may be blocking the rate service.',
      )
    } finally {
      setLoadingRates(false)
    }
  }

  useEffect(() => {
    if (category === 'currency' && !rates) loadRates()
  }, [category, rates])

  useEffect(() => {
    if (category === 'temperature') {
      setFrom('C')
      setTo('F')
    } else if (category === 'currency') {
      setFrom('USD')
      setTo('EUR')
    } else {
      const list = UNITS[category]
      setFrom(list[0].key)
      setTo(list[1]?.key ?? list[0].key)
    }
  }, [category])

  const numeric = Number(value.replace(/,/g, ''))
  const valid = value.trim() !== '' && Number.isFinite(numeric)

  const result = useMemo(() => {
    if (!valid) return null
    if (category === 'temperature') return convertTemp(numeric, from, to)
    if (category === 'currency') {
      if (!rates || !rates[from] || !rates[to]) return null
      return (numeric / rates[from]) * rates[to]
    }
    const list = UNITS[category]
    const f = list.find((u) => u.key === from)
    const t = list.find((u) => u.key === to)
    if (!f || !t) return null
    return (numeric * f.factor) / t.factor
  }, [valid, numeric, category, from, to, rates])

  const options =
    category === 'temperature'
      ? TEMPS
      : category === 'currency'
        ? Object.keys(CURRENCY_NAMES).map((code) => ({ key: code, label: `${code} — ${CURRENCY_NAMES[code]}` }))
        : UNITS[category].map((u) => ({ key: u.key, label: u.label }))

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <ToolShell
      tool={tool}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ['length', 'Length'],
            ['weight', 'Weight'],
            ['temperature', 'Temperature'],
            ['area', 'Area'],
            ['speed', 'Speed'],
            ['data', 'Data'],
            ['currency', 'Currency'],
          ] as [Category, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={
              category === key
                ? 'rounded-full border border-brand-600 bg-brand-600 px-3.5 py-1.5 text-[13px] font-semibold text-white'
                : 'rounded-full border border-surface-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft hover:border-brand-200 hover:text-brand-700'
            }
          >
            {label}
          </button>
        ))}
      </div>

      <Panel title="Convert">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-4">
            <Labeled label="Value">
              <TextInput value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="1" />
            </Labeled>
            <Labeled label="From">
              <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Labeled>
          </div>

          <button
            type="button"
            className="btn-ghost mx-auto mb-1 self-end"
            onClick={swap}
            aria-label="Swap units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div className="space-y-4">
            <div>
              <span className="label">Result</span>
              <div className="flex min-h-[42px] items-center rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5">
                <span className="break-all font-mono text-sm font-semibold text-brand-800">
                  {result === null ? '—' : formatNumber(result, Math.abs(result) < 1 ? 6 : 4)}
                </span>
              </div>
            </div>
            <Labeled label="To">
              <Select value={to} onChange={(e) => setTo(e.target.value)}>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Labeled>
          </div>
        </div>

        {result !== null && (
          <div className="mt-5">
            <Stat
              label="Conversion"
              value={`${formatNumber(numeric, 4)} ${from} = ${formatNumber(result, Math.abs(result) < 1 ? 6 : 4)} ${to}`}
              tone="brand"
            />
          </div>
        )}

        {!valid && value.trim() !== '' && <Notice tone="warn" className="mt-4">Enter a valid number.</Notice>}

        {category === 'currency' && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-ink-mute">
            {loadingRates && <span className="inline-flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading rates…</span>}
            {ratesDate && !loadingRates && <span>Rates updated: {ratesDate}</span>}
            <button type="button" className="btn-soft px-3 py-1.5" onClick={loadRates} disabled={loadingRates}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh rates
            </button>
          </div>
        )}
        {ratesError && <Notice tone="error" className="mt-4">{ratesError}</Notice>}
      </Panel>

      {category === 'data' && (
        <Panel className="mt-5" title="Common data sizes">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: '1 MB', bytes: 1024 ** 2 },
              { label: '1 GB', bytes: 1024 ** 3 },
              { label: '1 TB', bytes: 1024 ** 4 },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-surface-line p-4">
                <div className="font-display text-lg font-bold text-ink">{row.label}</div>
                <div className="mt-1 text-xs text-ink-mute">
                  {formatNumber(row.bytes, 0)} bytes · {formatNumber(row.bytes / 8, 0)} bits
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {category === 'temperature' && (
        <Panel className="mt-5" title="Reference temperatures">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Freezing point of water', c: 0 },
              { label: 'Room temperature', c: 21 },
              { label: 'Boiling point of water', c: 100 },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-surface-line p-4">
                <div className="text-sm font-bold text-ink">{row.label}</div>
                <div className="mt-1 font-mono text-xs text-ink-mute">
                  {row.c}°C · {convertTemp(row.c, 'C', 'F').toFixed(1)}°F · {convertTemp(row.c, 'C', 'K').toFixed(1)}K
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
