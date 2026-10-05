import { useEffect, useRef, useState } from 'react'
import { Flag, Pause, Play, RotateCcw, Timer as TimerIcon } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, SegmentedControl, Stat, TextInput } from '@/components/ui/Primitives'
import { formatDuration } from '@/lib/format'

type Mode = 'stopwatch' | 'timer' | 'clock'

const CITIES = [
  { name: 'London', zone: 'Europe/London' },
  { name: 'New York', zone: 'America/New_York' },
  { name: 'Los Angeles', zone: 'America/Los_Angeles' },
  { name: 'Dubai', zone: 'Asia/Dubai' },
  { name: 'Dhaka', zone: 'Asia/Dhaka' },
  { name: 'Kolkata', zone: 'Asia/Kolkata' },
  { name: 'Singapore', zone: 'Asia/Singapore' },
  { name: 'Tokyo', zone: 'Asia/Tokyo' },
  { name: 'Sydney', zone: 'Australia/Sydney' },
  { name: 'São Paulo', zone: 'America/Sao_Paulo' },
]

export default function Stopwatch({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<Mode>('stopwatch')

  // Stopwatch
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef(0)
  const baseRef = useRef(0)
  const rafRef = useRef<number>()

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(300)
  const [remaining, setRemaining] = useState(300)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const timerRef = useRef<number>()
  const alarmRef = useRef<{ ctx: AudioContext } | null>(null)

  // Clock
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const tick = () => {
    setElapsed(baseRef.current + (performance.now() - startRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (running) {
      startRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running])

  const startStopwatch = () => {
    baseRef.current = elapsed
    setRunning(true)
  }
  const pauseStopwatch = () => {
    setRunning(false)
  }
  const resetStopwatch = () => {
    setRunning(false)
    baseRef.current = 0
    setElapsed(0)
    setLaps([])
  }
  const addLap = () => {
    if (!running && elapsed === 0) return
    setLaps((prev) => [...prev, elapsed])
  }

  const startTimer = () => {
    if (remaining <= 0) setRemaining(timerSeconds)
    setTimerRunning(true)
    setTimerDone(false)
    let last = performance.now()
    let left = remaining > 0 ? remaining : timerSeconds
    timerRef.current = window.setInterval(() => {
      const current = performance.now()
      left -= (current - last) / 1000
      last = current
      if (left <= 0) {
        window.clearInterval(timerRef.current)
        setRemaining(0)
        setTimerRunning(false)
        setTimerDone(true)
        playAlarm()
      } else {
        setRemaining(left)
      }
    }, 200)
  }

  const pauseTimer = () => {
    window.clearInterval(timerRef.current)
    setTimerRunning(false)
  }

  const resetTimer = () => {
    window.clearInterval(timerRef.current)
    setTimerRunning(false)
    setTimerDone(false)
    setRemaining(timerSeconds)
  }

  const playAlarm = () => {
    try {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtor()
      alarmRef.current = { ctx }
      ;[0, 0.35, 0.7].forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset)
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.3)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + offset)
        osc.stop(ctx.currentTime + offset + 0.32)
      })
    } catch {
      /* audio not available */
    }
  }

  useEffect(() => () => {
    window.clearInterval(timerRef.current)
    alarmRef.current?.ctx.close().catch(() => {})
  }, [])

  const setPreset = (seconds: number) => {
    setTimerSeconds(seconds)
    setRemaining(seconds)
    setTimerRunning(false)
    setTimerDone(false)
    window.clearInterval(timerRef.current)
  }

  const fmtClock = (date: Date, zone: string) =>
    new Intl.DateTimeFormat(undefined, {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)

  const dayDiff = (zone: string) => {
    const local = now.getHours()
    const there = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', hour12: false }).format(now),
    )
    const delta = there - local
    if (delta === 0) return 'same time'
    return delta > 0 ? `+${delta}h` : `${delta}h`
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="stopwatch"
      content={
        <>
          <h2>Stopwatch, countdown timer and world clock</h2>
          <p>
            Three time tools in one place. Use the <strong>Stopwatch</strong> to time an activity
            with lap splits, the <strong>Timer</strong> to count down to zero with an audible alert,
            and the <strong>World clock</strong> to see the time in major cities at a glance.
          </p>
          <h2>Timing accurately</h2>
          <p>
            The stopwatch is based on your device's high-resolution clock rather than a simple
            counter, so it stays accurate over long sessions and keeps running smoothly while you use
            other tabs. Lap times are recorded to the hundredth of a second.
          </p>
          <h2>Uses for each tool</h2>
          <ul>
            <li><strong>Stopwatch</strong> — workouts, cooking, presentations, study sessions, interval training.</li>
            <li><strong>Timer</strong> — pomodoro sessions, reminders, timed tests, brewing coffee.</li>
            <li><strong>World clock</strong> — scheduling calls across time zones or checking what time it is for a friend abroad.</li>
          </ul>
        </>
      }
      faqs={[
        {
          q: 'Does the timer still work if I switch tabs?',
          a: 'Yes. The timer runs on a background interval and keeps counting, and the alert plays when it reaches zero as long as the tab stays open.',
        },
        {
          q: 'How accurate is the stopwatch?',
          a: 'It uses your device\'s high-resolution timer and displays hundredths of a second, which is more than accurate enough for everyday use.',
        },
        {
          q: 'Why do some world clock cities show a different day?',
          a: 'Time zones can differ by a full day. The offset shown next to each city tells you how far ahead or behind it is from your own local time.',
        },
      ]}
    >
      <div className="mb-5">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'stopwatch', label: 'Stopwatch' },
            { value: 'timer', label: 'Timer' },
            { value: 'clock', label: 'World clock' },
          ]}
        />
      </div>

      {mode === 'stopwatch' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Panel title="Stopwatch">
            <div className="rounded-2xl bg-ink py-10 text-center text-white">
              <div className="font-mono text-5xl font-bold tabular-nums sm:text-6xl">
                {formatDuration(elapsed)}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {!running ? (
                <button type="button" className="btn-primary" onClick={startStopwatch}>
                  <Play className="h-4 w-4" /> {elapsed > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button type="button" className="btn-ghost" onClick={pauseStopwatch}>
                  <Pause className="h-4 w-4" /> Pause
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={addLap} disabled={elapsed === 0}>
                <Flag className="h-4 w-4" /> Lap
              </button>
              <button type="button" className="btn-soft" onClick={resetStopwatch} disabled={elapsed === 0}>
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </Panel>

          <Panel title={`Laps (${laps.length})`}>
            {laps.length === 0 ? (
              <p className="text-sm text-ink-mute">Press Lap while the stopwatch runs to record split times.</p>
            ) : (
              <ol className="max-h-80 space-y-2 overflow-y-auto">
                {laps.map((lap, i) => {
                  const prev = i === 0 ? 0 : laps[i - 1]
                  return (
                    <li key={i} className="flex items-center justify-between rounded-xl border border-surface-line px-3 py-2 text-sm">
                      <span className="font-semibold text-ink">Lap {i + 1}</span>
                      <span className="font-mono text-ink-soft">{formatDuration(lap - prev)}</span>
                      <span className="font-mono text-xs text-ink-mute">{formatDuration(lap)}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </Panel>
        </div>
      )}

      {mode === 'timer' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Panel title="Countdown timer">
            <div className="rounded-2xl bg-ink py-10 text-center text-white">
              <div className="font-mono text-5xl font-bold tabular-nums sm:text-6xl">
                {(() => {
                  const total = Math.ceil(remaining)
                  const h = Math.floor(total / 3600)
                  const m = Math.floor((total % 3600) / 60)
                  const s = total % 60
                  const pad = (n: number) => String(n).padStart(2, '0')
                  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
                })()}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-line">
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-200"
                style={{ width: `${timerSeconds > 0 ? Math.max(0, Math.min(100, (remaining / timerSeconds) * 100)) : 0}%` }}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {!timerRunning ? (
                <button type="button" className="btn-primary" onClick={startTimer}>
                  <Play className="h-4 w-4" /> {remaining > 0 && remaining < timerSeconds ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button type="button" className="btn-ghost" onClick={pauseTimer}>
                  <Pause className="h-4 w-4" /> Pause
                </button>
              )}
              <button type="button" className="btn-soft" onClick={resetTimer}>
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            {timerDone && (
              <Notice tone="success" className="mt-4">
                Time is up! The alarm has sounded.
              </Notice>
            )}
          </Panel>

          <Panel title="Set duration">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '1 min', s: 60 },
                { label: '3 min', s: 180 },
                { label: '5 min', s: 300 },
                { label: '10 min', s: 600 },
                { label: '25 min', s: 1500 },
                { label: '1 hour', s: 3600 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="btn-soft"
                  onClick={() => setPreset(p.s)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Hours', key: 'h' },
                { label: 'Minutes', key: 'm' },
                { label: 'Seconds', key: 's' },
              ].map((f) => (
                <Labeled key={f.key} label={f.label}>
                  <TextInput
                    type="number"
                    min={0}
                    max={f.key === 'h' ? 23 : 59}
                    value={
                      f.key === 'h'
                        ? Math.floor(timerSeconds / 3600)
                        : f.key === 'm'
                          ? Math.floor((timerSeconds % 3600) / 60)
                          : timerSeconds % 60
                    }
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value) || 0)
                      const h = Math.floor(timerSeconds / 3600)
                      const m = Math.floor((timerSeconds % 3600) / 60)
                      const s = timerSeconds % 60
                      const next = f.key === 'h' ? v * 3600 + m * 60 + s : f.key === 'm' ? h * 3600 + v * 60 + s : h * 3600 + m * 60 + v
                      setPreset(Math.min(86399, next))
                    }}
                  />
                </Labeled>
              ))}
            </div>
            <div className="mt-4">
              <Stat label="Duration set" value={formatDuration(timerSeconds * 1000).replace(/\.\d+$/, '')} />
            </div>
          </Panel>
        </div>
      )}

      {mode === 'clock' && (
        <Panel title="World clock" description="Times update every second">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city) => (
              <div key={city.name} className="flex items-center justify-between rounded-xl border border-surface-line px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-ink">{city.name}</div>
                  <div className="text-[11px] font-medium text-ink-mute">{dayDiff(city.zone)} from you</div>
                </div>
                <div className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {fmtClock(now, city.zone)}
                </div>
              </div>
            ))}
          </div>
          <Notice className="mt-4">
            <span className="inline-flex items-center gap-2">
              <TimerIcon className="h-4 w-4" />
              Your local time: {now.toLocaleTimeString()} · {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </Notice>
        </Panel>
      )}
    </ToolShell>
  )
}
