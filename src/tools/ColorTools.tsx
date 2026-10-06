import { useMemo, useRef, useState } from 'react'
import { Droplet, Plus, Trash2 } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { CopyButton, Labeled, Notice, Panel, SegmentedControl, Slider } from '@/components/ui/Primitives'
import { loadImageElement } from '@/lib/image'
import { readFileAsDataURL } from '@/lib/files'

type Mode = 'picker' | 'palette' | 'gradient'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

function contrastText(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0B0E14' : '#FFFFFF'
}

export default function ColorTools({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<Mode>('picker')
  const [color, setColor] = useState('#345ef5')
  const [h, setH] = useState(225)
  const [s, setS] = useState(80)
  const [l, setL] = useState(58)
  const [palette, setPalette] = useState<string[]>(['#345ef5', '#0FA36B', '#F59E0B', '#EF4444', '#8B5CF6'])
  const [gradient, setGradient] = useState({ from: '#345ef5', to: '#0FA36B', angle: 135, type: 'linear' as 'linear' | 'radial' })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [pickError, setPickError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [r, g, b] = hexToRgb(color)
  const [hh, ss, ll] = rgbToHsl(r, g, b)

  const applyHsl = (nh: number, ns: number, nl: number) => {
    setH(nh)
    setS(ns)
    setL(nl)
    setColor(hslToHex(nh, ns, nl))
  }

  const cssGradient = useMemo(() => {
    const { from, to, angle, type } = gradient
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${from}, ${to})`
      : `radial-gradient(circle at 50% 50%, ${from}, ${to})`
  }, [gradient])

  const onPickFile = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setPickError(null)
    try {
      const url = await readFileAsDataURL(file)
      const img = await loadImageElement(url)
      const canvas = canvasRef.current
      if (!canvas) return
      const max = 700
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setImageUrl(url)
    } catch (e) {
      setPickError((e as Error).message)
    }
  }

  const pickFromCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height)
    const data = canvas.getContext('2d')!.getImageData(x, y, 1, 1).data
    setColor(rgbToHex(data[0], data[1], data[2]))
  }

  const harmony = (base: string, kind: 'complement' | 'analogous' | 'triadic'): string[] => {
    const [bh, bs, bl] = rgbToHsl(...hexToRgb(base))
    const rotate = (deg: number) => hslToHex((bh + deg + 360) % 360, bs, bl)
    if (kind === 'complement') return [base, rotate(180)]
    if (kind === 'analogous') return [rotate(-30), base, rotate(30)]
    return [base, rotate(120), rotate(240)]
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="color-tools"
    >
      <div className="mb-5">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'picker', label: 'Picker' },
            { value: 'palette', label: 'Palette' },
            { value: 'gradient', label: 'Gradient' },
          ]}
        />
      </div>

      {mode === 'picker' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Colour">
            <div
              className="grid h-32 place-items-center rounded-xl font-display text-xl font-bold"
              style={{ background: color, color: contrastText(color) }}
            >
              {color.toUpperCase()}
            </div>
            <div className="mt-4 space-y-4">
              <Labeled label="Pick a colour">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 w-full cursor-pointer rounded-xl border border-surface-line bg-white p-1"
                />
              </Labeled>
              <Slider label="Hue" min={0} max={360} value={h} onChange={(v) => applyHsl(v, s, l)} format={(v) => `${v}°`} />
              <Slider label="Saturation" min={0} max={100} value={s} onChange={(v) => applyHsl(h, v, l)} format={(v) => `${v}%`} />
              <Slider label="Lightness" min={0} max={100} value={l} onChange={(v) => applyHsl(h, s, v)} format={(v) => `${v}%`} />
            </div>
            <div className="mt-5 space-y-2">
              {[
                { label: 'HEX', value: color.toUpperCase() },
                { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
                { label: 'HSL', value: `hsl(${hh}, ${ss}%, ${ll}%)` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-surface-line px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">{row.label}</span>
                  <span className="font-mono text-sm text-ink">{row.value}</span>
                  <CopyButton value={row.value} label="" className="px-2.5 py-1.5" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Pick from an image" description="Upload a picture, then click a pixel">
            <label className="btn-ghost w-full cursor-pointer">
              <Droplet className="h-4 w-4" /> Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) onPickFile(Array.from(e.target.files))
                  e.target.value = ''
                }}
              />
            </label>
            {pickError && <Notice tone="error" className="mt-3">{pickError}</Notice>}
            <div className="mt-4">
              {imageUrl ? (
                <canvas
                  ref={canvasRef}
                  onClick={pickFromCanvas}
                  className="max-h-80 w-full cursor-crosshair rounded-xl border border-surface-line object-contain"
                />
              ) : (
                <div className="grid h-64 place-items-center rounded-xl border border-dashed border-surface-line text-sm text-ink-mute">
                  Your image will appear here
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {mode === 'palette' && (
        <Panel
          title="Palette"
          actions={
            <button type="button" className="btn-ghost" onClick={() => setPalette([...palette, color])}>
              <Plus className="h-4 w-4" /> Add current
            </button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {palette.map((c, i) => (
              <div key={`${c}-${i}`} className="group relative">
                <div
                  className="h-20 w-20 rounded-xl border border-surface-line"
                  style={{ background: c }}
                />
                <div className="mt-1.5 text-center font-mono text-[11px] text-ink-mute">{c.toUpperCase()}</div>
                <button
                  type="button"
                  aria-label={`Remove ${c}`}
                  onClick={() => setPalette(palette.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 hidden h-6 w-6 place-items-center rounded-full border border-surface-line bg-white text-ink-mute shadow-card group-hover:grid hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-ink">Harmonies from {color.toUpperCase()}</h3>
            {(['complement', 'analogous', 'triadic'] as const).map((kind) => (
              <div key={kind} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold capitalize text-ink-mute">{kind}</span>
                <div className="flex gap-1.5">
                  {harmony(color, kind).map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => setPalette([...palette, c])}
                      className="h-8 w-8 rounded-lg border border-surface-line"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <CopyButton value={palette.join('\n')} label="Copy all HEX" />
          </div>
        </Panel>
      )}

      {mode === 'gradient' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Preview">
            <div className="h-56 rounded-xl border border-surface-line" style={{ background: cssGradient }} />
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink px-4 py-3 font-mono text-xs leading-6 text-white">
              background: {cssGradient};
            </pre>
            <CopyButton value={`background: ${cssGradient};`} label="Copy CSS" className="mt-3" />
          </Panel>
          <Panel title="Settings">
            <div className="space-y-4">
              <Labeled label="Type">
                <SegmentedControl
                  value={gradient.type}
                  onChange={(v) => setGradient((g) => ({ ...g, type: v }))}
                  options={[
                    { value: 'linear', label: 'Linear' },
                    { value: 'radial', label: 'Radial' },
                  ]}
                />
              </Labeled>
              <Labeled label="From">
                <input
                  type="color"
                  value={gradient.from}
                  onChange={(e) => setGradient((g) => ({ ...g, from: e.target.value }))}
                  className="h-11 w-full cursor-pointer rounded-xl border border-surface-line bg-white p-1"
                />
              </Labeled>
              <Labeled label="To">
                <input
                  type="color"
                  value={gradient.to}
                  onChange={(e) => setGradient((g) => ({ ...g, to: e.target.value }))}
                  className="h-11 w-full cursor-pointer rounded-xl border border-surface-line bg-white p-1"
                />
              </Labeled>
              {gradient.type === 'linear' && (
                <Slider
                  label="Angle"
                  min={0}
                  max={360}
                  value={gradient.angle}
                  onChange={(v) => setGradient((g) => ({ ...g, angle: v }))}
                  format={(v) => `${v}°`}
                />
              )}
            </div>
          </Panel>
        </div>
      )}
    </ToolShell>
  )
}
