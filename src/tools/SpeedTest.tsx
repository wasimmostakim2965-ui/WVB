import { useRef, useState } from 'react'
import { Gauge, Play, RotateCcw } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Notice, Panel, Stat } from '@/components/ui/Primitives'

type Phase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error'

const DOWN_URL = 'https://speed.cloudflare.com/__down?bytes='
const UP_URL = 'https://speed.cloudflare.com/__up'

function qualityLabel(mbps: number): { label: string; tone: 'bad' | 'warn' | 'good' } {
  if (mbps >= 100) return { label: 'Excellent', tone: 'good' }
  if (mbps >= 25) return { label: 'Good', tone: 'good' }
  if (mbps >= 10) return { label: 'Fair', tone: 'warn' }
  if (mbps > 0) return { label: 'Slow', tone: 'bad' }
  return { label: '—', tone: 'warn' }
}

function Gauge3({ value, max, unit }: { value: number; max: number; unit: string }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  const angle = -120 + pct * 240
  const radius = 88
  const cx = 110
  const cy = 110
  const arc = (from: number, to: number) => {
    const p = (deg: number) => {
      const r = ((deg - 90) * Math.PI) / 180
      return [cx + radius * Math.cos(r), cy + radius * Math.sin(r)]
    }
    const [x1, y1] = p(from)
    const [x2, y2] = p(to)
    const large = Math.abs(to - from) > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`
  }
  return (
    <svg viewBox="0 0 220 170" className="mx-auto w-full max-w-[300px]">
      <path d={arc(-120, 120)} fill="none" stroke="#E6E8EC" strokeWidth={14} strokeLinecap="round" />
      <path
        d={arc(-120, angle)}
        fill="none"
        stroke="#1f3fe0"
        strokeWidth={14}
        strokeLinecap="round"
        style={{ transition: 'all .3s ease' }}
      />
      <text x="110" y="104" textAnchor="middle" className="fill-ink font-display" fontSize="34" fontWeight="800">
        {value >= 100 ? Math.round(value) : value.toFixed(1)}
      </text>
      <text x="110" y="126" textAnchor="middle" className="fill-ink-mute" fontSize="13" fontWeight="600">
        {unit}
      </text>
    </svg>
  )
}

export default function SpeedTest({ tool }: { tool: ToolMeta }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [ping, setPing] = useState<number | null>(null)
  const [jitter, setJitter] = useState<number | null>(null)
  const [down, setDown] = useState(0)
  const [up, setUp] = useState(0)
  const [live, setLive] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const measurePing = async (): Promise<number[]> => {
    const samples: number[] = []
    for (let i = 0; i < 5; i++) {
      const start = performance.now()
      await fetch(`${DOWN_URL}0&r=${Math.random()}`, { cache: 'no-store' })
      samples.push(performance.now() - start)
    }
    return samples
  }

  const measureDownload = async (): Promise<number> => {
    const bytes = 12_000_000
    const start = performance.now()
    const res = await fetch(`${DOWN_URL}${bytes}&r=${Math.random()}`, { cache: 'no-store' })
    if (!res.body) {
      const blob = await res.blob()
      const secs = (performance.now() - start) / 1000
      setLive((blob.size * 8) / secs / 1e6)
      return (blob.size * 8) / secs / 1e6
    }
    const reader = res.body.getReader()
    let received = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      received += value?.length ?? 0
      const secs = (performance.now() - start) / 1000
      if (secs > 0.05) setLive((received * 8) / secs / 1e6)
      if (abortRef.current) break
    }
    const secs = (performance.now() - start) / 1000
    return (received * 8) / secs / 1e6
  }

  const measureUpload = async (): Promise<number> => {
    const bytes = 4_000_000
    const payload = new Uint8Array(bytes)
    crypto.getRandomValues(payload.subarray(0, 65536))
    const start = performance.now()
    await fetch(`${UP_URL}?r=${Math.random()}`, {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    })
    const secs = (performance.now() - start) / 1000
    const mbps = (bytes * 8) / secs / 1e6
    setLive(mbps)
    return mbps
  }

  const run = async () => {
    abortRef.current = false
    setError(null)
    setPing(null)
    setJitter(null)
    setDown(0)
    setUp(0)
    setLive(0)
    try {
      setPhase('ping')
      const pings = await measurePing()
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length
      const jit =
        pings.length > 1
          ? pings.slice(1).reduce((a, b, i) => a + Math.abs(b - pings[i]), 0) / (pings.length - 1)
          : 0
      setPing(avg)
      setJitter(jit)

      setPhase('download')
      const d = await measureDownload()
      setDown(d)

      setPhase('upload')
      const u = await measureUpload()
      setUp(u)

      setPhase('done')
    } catch (e) {
      setError(
        (e as Error).message ||
          'The test could not run. A network filter or ad blocker may be blocking the test endpoint.',
      )
      setPhase('error')
    }
  }

  const running = phase === 'ping' || phase === 'download' || phase === 'upload'
  const current = phase === 'upload' ? up || live : phase === 'download' ? down || live : 0
  const gaugeValue = phase === 'ping' ? (ping ?? 0) : phase === 'done' ? down : current
  const gaugeUnit = phase === 'ping' ? 'ms latency' : 'Mbps'

  return (
    <ToolShell
      tool={tool}
      adSlot="speed-test"
      content={
        <>
          <h2>Test your internet speed</h2>
          <p>
            Press start and the test runs three checks in sequence: <strong>latency</strong> (how
            quickly data travels back and forth, measured in milliseconds),{' '}
            <strong>download speed</strong> (how fast data arrives) and <strong>upload speed</strong>{' '}
            (how fast data leaves your device). Speeds are shown in megabits per second (Mbps).
          </p>
          <h2>Understanding the numbers</h2>
          <ul>
            <li><strong>Ping below 50 ms</strong> feels instant for browsing, calls and gaming.</li>
            <li><strong>Download 25 Mbps or more</strong> handles streaming in 4K on one device.</li>
            <li><strong>Upload 10 Mbps or more</strong> is comfortable for video calls and large file transfers.</li>
            <li><strong>Jitter</strong> measures how much the latency varies; lower is better for calls.</li>
          </ul>
          <h2>Getting the most accurate result</h2>
          <p>
            For a fair reading, stop other downloads and streams, move closer to your router, and run
            the test more than once. Wi-Fi speed varies with distance and interference, so a wired
            connection will always be the most consistent.
          </p>
          <h2>How the test works</h2>
          <p>
            The tool transfers small test files to and from a public speed-test endpoint and measures
            how long each transfer takes. No personal information is collected.
          </p>
        </>
      }
      faqs={[
        {
          q: 'Why is my result lower than my provider advertises?',
          a: 'Advertised speeds are the maximum under ideal conditions. Wi-Fi, distance, other devices, peak-time congestion and your own device can all reduce the figure you actually get.',
        },
        {
          q: 'How much speed do I need?',
          a: 'For one person streaming HD and browsing, around 25 Mbps download is comfortable. Add roughly 5–10 Mbps for each additional stream, and choose an upload speed of at least 10 Mbps if you make video calls.',
        },
        {
          q: 'Does the test use my data allowance?',
          a: 'Yes, a small amount. The test transfers a few megabytes in each direction, so on a metered mobile connection it will use a little data.',
        },
      ]}
    >
      <Panel title="Speed test">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-center">
          <div>
            <Gauge3 value={gaugeValue} max={phase === 'ping' ? 300 : 200} unit={gaugeUnit} />
            <div className="mt-2 text-center text-sm font-semibold text-ink-soft">
              {phase === 'idle' && 'Ready when you are'}
              {phase === 'ping' && 'Measuring latency…'}
              {phase === 'download' && 'Measuring download…'}
              {phase === 'upload' && 'Measuring upload…'}
              {phase === 'done' && 'Test complete'}
              {phase === 'error' && 'Test failed'}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Ping" value={ping === null ? '—' : `${Math.round(ping)} ms`} />
              <Stat label="Jitter" value={jitter === null ? '—' : `${Math.round(jitter)} ms`} />
              <Stat label="Download" value={down ? `${down.toFixed(1)}` : '—'} sub="Mbps" tone="brand" />
              <Stat label="Upload" value={up ? `${up.toFixed(1)}` : '—'} sub="Mbps" tone="brand" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={run} disabled={running}>
                {running ? (
                  <>
                    <Gauge className="h-4 w-4 animate-pulse" /> Testing…
                  </>
                ) : phase === 'done' || phase === 'error' ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Test again
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start test
                  </>
                )}
              </button>
              {phase === 'done' && down > 0 && (
                <span className="chip">
                  Connection quality: {qualityLabel(down).label}
                </span>
              )}
            </div>

            {error && <Notice tone="error" className="mt-4">{error}</Notice>}
          </div>
        </div>
      </Panel>

      {phase === 'done' && (
        <Panel className="mt-5" title="What this means">
          <div className="prose-wvb">
            <p>
              Your connection measured <strong>{down.toFixed(1)} Mbps download</strong> and{' '}
              <strong>{up.toFixed(1)} Mbps upload</strong> with a latency of{' '}
              <strong>{ping ? Math.round(ping) : 0} ms</strong>.
            </p>
            <ul>
              <li>
                Streaming: {down >= 25 ? 'comfortable for 4K on one device' : down >= 5 ? 'fine for HD on one device' : 'may buffer on HD video'}.
              </li>
              <li>
                Video calls: {ping !== null && ping < 60 && up >= 5 ? 'should be smooth' : 'may be unstable — check your latency and upload speed'}.
              </li>
              <li>
                Gaming: {ping !== null && ping < 50 ? 'low latency, good for online play' : 'higher latency may be noticeable in fast games'}.
              </li>
            </ul>
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
