import { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Dropzone } from '@/components/ui/Dropzone'
import { Labeled, Notice, Panel, Select, Slider, Stat } from '@/components/ui/Primitives'
import { formatBytes } from '@/lib/format'
import {
  canvasToBlob,
  canvasToBmp,
  fileToCanvas,
  renameExtension,
  supportsMime,
} from '@/lib/image'
import { downloadBlob } from '@/lib/files'

type TargetFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'avif'

const FORMATS: { value: TargetFormat; label: string; ext: string; mime: string }[] = [
  { value: 'png', label: 'PNG', ext: 'png', mime: 'image/png' },
  { value: 'jpeg', label: 'JPG', ext: 'jpg', mime: 'image/jpeg' },
  { value: 'webp', label: 'WEBP', ext: 'webp', mime: 'image/webp' },
  { value: 'avif', label: 'AVIF', ext: 'avif', mime: 'image/avif' },
  { value: 'bmp', label: 'BMP', ext: 'bmp', mime: 'image/bmp' },
]

interface Converted {
  id: string
  name: string
  from: string
  to: string
  size: number
  blob: Blob
  url: string
  preview: string
}

export default function ImageConverter({ tool }: { tool: ToolMeta }) {
  const [format, setFormat] = useState<TargetFormat>('png')
  const [quality, setQuality] = useState(92)
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<Converted[]>([])
  const [error, setError] = useState<string | null>(null)

  const target = FORMATS.find((f) => f.value === format)!

  const convert = async (files: File[]) => {
    setError(null)
    setBusy(true)
    const out: Converted[] = []
    const failures: string[] = []
    for (const file of files) {
      try {
        if (file.type === 'image/svg+xml') {
          // SVG has no raster pixels: draw it onto a canvas first.
          const url = URL.createObjectURL(file)
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image()
            el.onload = () => resolve(el)
            el.onerror = () => reject(new Error('SVG could not be rendered'))
            el.src = url
          })
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || 1024
          canvas.height = img.naturalHeight || 1024
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(url)
          out.push(await encode(canvas, file.name, 'SVG'))
          continue
        }
        const { canvas } = await fileToCanvas(file)
        out.push(await encode(canvas, file.name, file.type.replace('image/', '').toUpperCase() || '?'))
      } catch (e) {
        failures.push(`${file.name}: ${(e as Error).message}`)
      }
    }
    setResults((prev) => [...out, ...prev])
    if (failures.length) setError(failures.join(' · '))
    setBusy(false)
  }

  const encode = async (
    canvas: HTMLCanvasElement,
    name: string,
    fromLabel: string,
  ): Promise<Converted> => {
    const blob =
      format === 'bmp'
        ? canvasToBmp(canvas)
        : await canvasToBlob(canvas, target.mime, format === 'png' ? undefined : quality / 100)
    return {
      id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: renameExtension(name, target.ext),
      from: fromLabel,
      to: target.label,
      size: blob.size,
      blob,
      url: URL.createObjectURL(blob),
      preview: URL.createObjectURL(blob),
    }
  }

  const clearAll = () => {
    results.forEach((r) => {
      URL.revokeObjectURL(r.url)
      URL.revokeObjectURL(r.preview)
    })
    setResults([])
  }

  const lossy = format !== 'png' && format !== 'bmp'
  const avifOk = format !== 'avif' || supportsMime('image/avif')

  return (
    <ToolShell
      tool={tool}
      adSlot="image-converter"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Panel title="Upload images" description="JPG, PNG, WEBP, GIF, SVG, BMP or AVIF">
          <Dropzone
            accept="image/*,.svg"
            onFiles={convert}
            subtitle="Converted in your browser — nothing is uploaded"
          />
          {error && (
            <Notice tone="error" className="mt-4">
              {error}
            </Notice>
          )}
          {!avifOk && (
            <Notice tone="warn" className="mt-4">
              This browser cannot encode AVIF. Choose PNG or WEBP instead.
            </Notice>
          )}
        </Panel>

        <Panel title="Output settings">
          <div className="space-y-5">
            <Labeled label="Convert to">
              <Select value={format} onChange={(e) => setFormat(e.target.value as TargetFormat)}>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Labeled>
            {lossy && (
              <Slider
                label="Quality"
                min={10}
                max={100}
                value={quality}
                onChange={setQuality}
                format={(v) => `${v}%`}
              />
            )}
            <div className="rounded-xl bg-surface-muted/60 p-3 text-xs leading-5 text-ink-mute">
              {lossy
                ? 'Lower quality means smaller files. Around 80% is a good balance for photos.'
                : 'This format is lossless, so the quality slider does not apply.'}
            </div>
          </div>
        </Panel>
      </div>

      {busy && <Notice className="mt-5">Converting…</Notice>}

      {results.length > 0 && (
        <Panel
          className="mt-5"
          title={`Converted files (${results.length})`}
          actions={
            <button type="button" className="btn-ghost" onClick={clearAll}>
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-surface-line p-3">
                <img
                  src={r.preview}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg border border-surface-line object-cover"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)',
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-ink-mute">
                    {r.from} → {r.to} · {formatBytes(r.size)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-soft shrink-0"
                  onClick={() => downloadBlob(r.blob, r.name)}
                >
                  <Download className="h-4 w-4" /> Save
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Files" value={results.length} />
            <Stat label="Total size" value={formatBytes(results.reduce((a, r) => a + r.size, 0))} />
            <Stat label="Format" value={target.label} tone="brand" />
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
