import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, RefreshCw, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, SegmentedControl, Slider, Stat } from '@/components/ui/Primitives'
import { cn } from '@/lib/cn'

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
}

const AMBIGUOUS = 'Il1O0o'

function randomInt(max: number): number {
  if (max <= 0) return 0
  const buf = new Uint32Array(1)
  const limit = Math.floor(0xffffffff / max) * max
  let value: number
  do {
    crypto.getRandomValues(buf)
    value = buf[0]
  } while (value >= limit)
  return value % max
}

function pick(pool: string): string {
  return pool[randomInt(pool.length)]
}

function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars
}

interface Strength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  guesses: number
  crackTime: string
  tone: 'bad' | 'warn' | 'good'
  suggestions: string[]
}

function humanTime(seconds: number): string {
  if (seconds < 1) return 'instantly'
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [365, 'day'],
    [100, 'year'],
    [1e9, 'century'],
  ]
  let value = seconds
  let name = 'second'
  for (let i = 0; i < units.length; i++) {
    const [div, label] = units[i]
    if (value < div) {
      name = label
      break
    }
    value /= div
    name = units[i + 1] ? units[i + 1][1] : 'century'
  }
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString()
  const plural = name === 'century' ? 'centuries' : `${name}s`
  return `${rounded} ${Number(rounded) === 1 ? name : plural}`
}

function analyze(pw: string): Strength {
  const suggestions: string[] = []
  let poolSize = 0
  if (/[a-z]/.test(pw)) poolSize += 26
  else suggestions.push('Add lowercase letters')
  if (/[A-Z]/.test(pw)) poolSize += 26
  else suggestions.push('Add uppercase letters')
  if (/\d/.test(pw)) poolSize += 10
  else suggestions.push('Add numbers')
  if (/[^A-Za-z0-9]/.test(pw)) poolSize += 30
  else suggestions.push('Add a symbol such as ! or #')

  const common = ['password', 'qwerty', '123456', 'letmein', 'admin', 'welcome', 'iloveyou', 'dragon']
  const lower = pw.toLowerCase()
  const isCommon = common.some((c) => lower.includes(c))
  const repeated = /(.)\1{2,}/.test(pw)
  const sequential = /(abc|bcd|cde|123|234|345|456|567|678|789|qwe|wer|ert)/i.test(pw)

  const entropyBits = pw.length * Math.log2(Math.max(poolSize, 2))
  let guesses = Math.pow(2, entropyBits)
  if (isCommon) {
    guesses = Math.min(guesses, 1e5)
    suggestions.push('Avoid common words like "password" or "qwerty"')
  }
  if (repeated) {
    guesses = Math.min(guesses, guesses / 8)
    suggestions.push('Avoid repeating the same character three times in a row')
  }
  if (sequential) {
    guesses = Math.min(guesses, guesses / 6)
    suggestions.push('Avoid sequences like "abc" or "123"')
  }

  const perSecond = 1e10 // offline attack against a fast hash
  const crackSeconds = guesses / perSecond / 2

  let score: Strength['score'] = 0
  if (entropyBits >= 100 && !isCommon) score = 4
  else if (entropyBits >= 75 && !isCommon) score = 3
  else if (entropyBits >= 50 && !isCommon) score = 2
  else if (entropyBits >= 35) score = 1
  if (pw.length === 0) score = 0

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  const tone: Strength['tone'] = score >= 3 ? 'good' : score === 2 ? 'warn' : 'bad'
  return { score, label: labels[score], guesses, crackTime: humanTime(crackSeconds), tone, suggestions }
}

export default function PasswordGenerator({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<'generate' | 'check'>('generate')
  const [length, setLength] = useState(20)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true, avoidAmbiguous: false })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [testPw, setTestPw] = useState('')

  const pool = useMemo(() => {
    let p = ''
    if (opts.lower) p += SETS.lower
    if (opts.upper) p += SETS.upper
    if (opts.digits) p += SETS.digits
    if (opts.symbols) p += SETS.symbols
    if (opts.avoidAmbiguous) p = [...p].filter((c) => !AMBIGUOUS.includes(c)).join('')
    return p
  }, [opts])

  const generate = useCallback(() => {
    if (!pool) {
      setPassword('')
      return
    }
    const required: string[] = []
    if (opts.lower) required.push(pick([...SETS.lower].filter((c) => !opts.avoidAmbiguous || !AMBIGUOUS.includes(c)).join('') || SETS.lower))
    if (opts.upper) required.push(pick([...SETS.upper].filter((c) => !opts.avoidAmbiguous || !AMBIGUOUS.includes(c)).join('') || SETS.upper))
    if (opts.digits) required.push(pick([...SETS.digits].filter((c) => !opts.avoidAmbiguous || !AMBIGUOUS.includes(c)).join('') || SETS.digits))
    if (opts.symbols) required.push(pick(SETS.symbols))

    const chars = [...required]
    while (chars.length < length) chars.push(pick(pool))
    setPassword(shuffle(chars.slice(0, length)).join(''))
  }, [length, opts, pool])

  useEffect(() => {
    if (mode === 'generate') generate()
  }, [mode, generate])

  const strength = analyze(mode === 'generate' ? password : testPw)

  const bars = [0, 1, 2, 3, 4]
  const barColor = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

  return (
    <ToolShell
      tool={tool}
      adSlot="password-generator"
    >
      <div className="mb-5">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: 'generate', label: 'Generate' },
            { value: 'check', label: 'Check strength' },
          ]}
        />
      </div>

      {mode === 'generate' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel title="Your password">
            <div className="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-muted/50 px-4 py-4">
              <span className="min-w-0 flex-1 break-all font-mono text-lg font-semibold text-ink">
                {password || '—'}
              </span>
              <button
                type="button"
                className="btn-soft shrink-0"
                onClick={async () => {
                  await navigator.clipboard.writeText(password)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1600)
                }}
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" className="btn-soft shrink-0" onClick={generate} aria-label="Generate again">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <div className="flex gap-1.5">
                {bars.map((b) => (
                  <span
                    key={b}
                    className={cn('h-1.5 flex-1 rounded-full', b <= strength.score ? barColor[strength.score] : 'bg-surface-line')}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                {strength.score >= 3 ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : strength.score === 2 ? (
                  <ShieldQuestion className="h-4 w-4 text-amber-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={
                    strength.tone === 'good' ? 'text-emerald-600' : strength.tone === 'warn' ? 'text-amber-600' : 'text-red-600'
                  }
                >
                  {strength.label}
                </span>
                <span className="font-normal text-ink-mute">· cracked in {strength.crackTime}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Options">
            <div className="space-y-5">
              <Slider label="Length" min={8} max={64} value={length} onChange={setLength} />
              <div className="space-y-2.5">
                {[
                  { key: 'lower' as const, label: 'Lowercase (a–z)' },
                  { key: 'upper' as const, label: 'Uppercase (A–Z)' },
                  { key: 'digits' as const, label: 'Numbers (0–9)' },
                  { key: 'symbols' as const, label: 'Symbols (!@#…)' },
                  { key: 'avoidAmbiguous' as const, label: 'Avoid look-alike characters' },
                ].map((o) => (
                  <label key={o.key} className="flex items-center gap-2 text-sm text-ink-soft">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-surface-line accent-brand-600"
                      checked={opts[o.key]}
                      onChange={(e) => setOpts((prev) => ({ ...prev, [o.key]: e.target.checked }))}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
              {!pool && <Notice tone="warn">Select at least one character type.</Notice>}
              <Stat label="Possible combinations" value={pool ? `~10^${Math.round(length * Math.log10(pool.length))}` : '—'} tone="brand" />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel title="Test a password">
            <Labeled label="Password to check">
              <input
                type="text"
                className="field font-mono"
                value={testPw}
                onChange={(e) => setTestPw(e.target.value)}
                placeholder="Type or paste a password"
                autoComplete="off"
                spellCheck={false}
              />
            </Labeled>
            <Notice tone="info" className="mt-4">
              This runs locally. Your password is never sent to a server or stored.
            </Notice>
            {testPw && (
              <div className="mt-5">
                <div className="flex gap-1.5">
                  {bars.map((b) => (
                    <span
                      key={b}
                      className={cn('h-1.5 flex-1 rounded-full', b <= strength.score ? barColor[strength.score] : 'bg-surface-line')}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm font-semibold text-ink-soft">
                  {strength.label} · would take about {strength.crackTime} to crack
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Suggestions">
            {strength.suggestions.length === 0 ? (
              <p className="text-sm text-emerald-600">This password looks strong. Keep it unique to one account.</p>
            ) : (
              <ul className="space-y-2">
                {strength.suggestions.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-ink-mute">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </ToolShell>
  )
}
