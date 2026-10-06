import { useMemo, useState } from 'react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, SegmentedControl, Slider, Stat } from '@/components/ui/Primitives'
import { formatNumber } from '@/lib/format'

function emi(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0
  if (annualRate <= 0) return principal / months
  const r = annualRate / 100 / 12
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export default function LoanCalculator({ tool }: { tool: ToolMeta }) {
  const [amount, setAmount] = useState(250000)
  const [rate, setRate] = useState(8.5)
  const [years, setYears] = useState(5)
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'BDT' | 'INR'>('USD')
  const symbol = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹' }[currency]

  const months = years * 12
  const monthly = emi(amount, rate, months)
  const total = monthly * months
  const interest = total - amount
  const principalPct = total > 0 ? (amount / total) * 100 : 0

  const schedule = useMemo(() => {
    const r = rate / 100 / 12
    let balance = amount
    const rows: { year: number; principal: number; interest: number; balance: number }[] = []
    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0
      let yearInterest = 0
      for (let m = 0; m < 12; m++) {
        const int = balance * r
        const prin = monthly - int
        yearPrincipal += prin
        yearInterest += int
        balance -= prin
      }
      rows.push({ year: y, principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) })
    }
    return rows
  }, [amount, rate, years, monthly])

  const fmt = (n: number) => `${symbol}${formatNumber(Math.round(n))}`

  return (
    <ToolShell
      tool={tool}
      adSlot="loan-calculator"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Panel title="Loan details">
          <div className="space-y-6">
            <div>
              <Labeled label="Currency">
                <SegmentedControl
                  value={currency}
                  onChange={(v) => setCurrency(v)}
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'INR', label: 'INR' },
                    { value: 'BDT', label: 'BDT' },
                  ]}
                />
              </Labeled>
            </div>
            <Slider
              label="Loan amount"
              min={1000}
              max={2_000_000}
              step={1000}
              value={amount}
              onChange={setAmount}
              format={fmt}
            />
            <Slider
              label="Annual interest rate"
              min={0.1}
              max={30}
              step={0.1}
              value={rate}
              onChange={setRate}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <Slider label="Term" min={1} max={30} value={years} onChange={setYears} format={(v) => `${v} year${v === 1 ? '' : 's'}`} />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Monthly EMI" value={fmt(monthly)} tone="brand" />
              <Stat label="Total interest" value={fmt(interest)} tone="warn" />
              <Stat label="Total payment" value={fmt(total)} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-brand-700">Principal {principalPct.toFixed(0)}%</span>
                <span className="text-amber-600">Interest {(100 - principalPct).toFixed(0)}%</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-surface-line">
                <div className="bg-brand-500" style={{ width: `${principalPct}%` }} />
                <div className="bg-amber-400" style={{ width: `${100 - principalPct}%` }} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Yearly breakdown">
          <div className="overflow-hidden rounded-xl border border-surface-line">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted/60 text-left text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                <tr>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Principal</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-line">
                {schedule.map((row) => (
                  <tr key={row.year}>
                    <td className="px-3 py-2 font-semibold text-ink">{row.year}</td>
                    <td className="px-3 py-2 text-ink-soft">{fmt(row.principal)}</td>
                    <td className="px-3 py-2 text-amber-600">{fmt(row.interest)}</td>
                    <td className="px-3 py-2 text-ink-mute">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {years > 15 && (
            <Notice className="mt-3">
              Over {years} years you will pay {fmt(interest)} in interest — more than{' '}
              {Math.round((interest / amount) * 100)}% of the amount borrowed.
            </Notice>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}
