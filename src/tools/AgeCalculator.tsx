import { useEffect, useMemo, useState } from 'react'
import { Cake, CalendarDays, Clock } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Panel, Stat } from '@/components/ui/Primitives'

function toInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function diff(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear()
  let months = to.getMonth() - from.getMonth()
  let days = to.getDate() - from.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const ms = to.getTime() - from.getTime()
  const totalDays = Math.floor(ms / 86400000)
  const totalWeeks = Math.floor(totalDays / 7)
  const totalMonths = years * 12 + months
  const totalHours = Math.floor(ms / 3600000)
  const totalMinutes = Math.floor(ms / 60000)
  return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, totalMinutes }
}

export default function AgeCalculator({ tool }: { tool: ToolMeta }) {
  const [birth, setBirth] = useState('2000-01-01')
  const [asOf, setAsOf] = useState(toInput(new Date()))
  const [from, setFrom] = useState(toInput(new Date()))
  const [to, setTo] = useState(toInput(new Date()))
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const age = useMemo(() => {
    const b = new Date(birth)
    const a = new Date(asOf)
    if (Number.isNaN(b.getTime()) || Number.isNaN(a.getTime()) || b > a) return null
    return diff(b, a)
  }, [birth, asOf])

  const nextBirthday = useMemo(() => {
    const b = new Date(birth)
    if (Number.isNaN(b.getTime())) return null
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    let next = new Date(today.getFullYear(), b.getMonth(), b.getDate())
    if (next < today) next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate())
    const days = Math.ceil((next.getTime() - now.getTime()) / 86400000)
    const turning = next.getFullYear() - b.getFullYear()
    return { next, days, turning }
  }, [birth, now])

  const range = useMemo(() => {
    const f = new Date(from)
    const t = new Date(to)
    if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return null
    const [start, end] = f <= t ? [f, t] : [t, f]
    return diff(start, end)
  }, [from, to])

  return (
    <ToolShell
      tool={tool}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Age calculator">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Date of birth">
              <input type="date" className="field" value={birth} max={asOf} onChange={(e) => setBirth(e.target.value)} />
            </Labeled>
            <Labeled label="Age at date">
              <input type="date" className="field" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </Labeled>
          </div>

          {age ? (
            <>
              <div className="mt-6 rounded-2xl bg-ink px-5 py-6 text-center text-white">
                <div className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {age.years} <span className="text-xl font-bold text-white/70">years</span> {age.months}{' '}
                  <span className="text-xl font-bold text-white/70">months</span> {age.days}{' '}
                  <span className="text-xl font-bold text-white/70">days</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Months" value={age.totalMonths.toLocaleString()} />
                <Stat label="Weeks" value={age.totalWeeks.toLocaleString()} />
                <Stat label="Days" value={age.totalDays.toLocaleString()} />
                <Stat label="Hours" value={age.totalHours.toLocaleString()} />
              </div>
              <Stat label="Total minutes" value={age.totalMinutes.toLocaleString()} tone="brand" />
            </>
          ) : (
            <p className="mt-5 text-sm text-ink-mute">Choose a valid birth date that is not in the future.</p>
          )}
        </Panel>

        <div className="space-y-5">
          {nextBirthday && (
            <Panel title="Next birthday">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <Cake className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-display text-2xl font-extrabold text-ink">
                    {nextBirthday.days === 0 ? 'Today!' : `${nextBirthday.days} day${nextBirthday.days === 1 ? '' : 's'} to go`}
                  </div>
                  <div className="text-sm text-ink-mute">
                    You turn {nextBirthday.turning} on{' '}
                    {nextBirthday.next.toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="Difference between two dates">
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Start date">
                <input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Labeled>
              <Labeled label="End date">
                <input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} />
              </Labeled>
            </div>
            {range && (
              <>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                  <CalendarDays className="h-4 w-4 text-brand-600" />
                  {range.years} years, {range.months} months, {range.days} days
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Stat label="Total days" value={range.totalDays.toLocaleString()} tone="brand" />
                  <Stat label="Total weeks" value={range.totalWeeks.toLocaleString()} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-ink-mute">
                  <Clock className="h-3.5 w-3.5" />
                  {range.totalHours.toLocaleString()} hours · {range.totalMinutes.toLocaleString()} minutes
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </ToolShell>
  )
}
