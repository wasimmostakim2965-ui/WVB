import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Dropzone } from '@/components/ui/Dropzone'
import { Labeled, Notice, Panel, SegmentedControl, Select, Slider, Stat } from '@/components/ui/Primitives'
import { formatBytes } from '@/lib/format'
import { baseName, canvasToBlob, fileToCanvas, loadImageElement } from '@/lib/image'
import { downloadBlob, readFileAsDataURL } from '@/lib/files'

type Mode = 'resize' | 'compress' | 'crop'
type OutFormat = 'jpeg' | 'png' | 'webp'

interface Source {
  file: File
  dataUrl: string
  width: number
  height: number
  size: number
}

interface Crop {
  x: number
  y: number
  w: number
  h: number
}

export default function ImageResizer({ tool }: { tool: ToolMeta }) {
  const [src, setSrc] = useState<Source | null>(null)
  const [mode, setMode] = useState<Mode>('resize')
  const [format, setFormat] = useState<OutFormat>('jpeg')
  const [quality, setQuality] = useState(80)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lock, setLock] = useState(true)
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 100, h: 100 })
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const aspect = src ? src.width / src.height : 1

  const load = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setError(null)
    setResult(null)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await loadImageElement(dataUrl)
      const width0 = img.naturalWidth || img.width
      const height0 = img.naturalHeight || img.height
      setSrc({ file, dataUrl, width: width0, height: height0, size: file.size })
      setWidth(width0)
      setHeight(height0)
      setCrop({ x: 0, y: 0, w: 100, h: 100 })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const onWidth = (v: number) => {
    setWidth(v)
    if (lock && src) setHeight(Math.max(1, Math.round(v / aspect)))
  }
  const onHeight = (v: number) => {
    setHeight(v)
    if (lock && src) setWidth(Math.max(1, Math.round(v * aspect)))
  }

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url)
    }
  }, [result])

  const run = async () => {
    if (!src) return
    setBusy(true)
    setError(null)
    try {
      const { canvas } = await fileToCanvas(src.file)
      const mime = `image/${format}`
      let outCanvas = canvas

      if (mode === 'crop') {
        const cx = Math.round((crop.x / 100) * canvas.width)
        const cy = Math.round((crop.y / 100) * canvas.height)
        const cw = Math.max(1, Math.round((crop.w / 100) * canvas.width))
        const ch = Math.max(1, Math.round((crop.h / 100) * canvas.height))
        const cropped = document.createElement('canvas')
        cropped.width = cw
        cropped.height = ch
        cropped.getContext('2d')!.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch)
        outCanvas = cropped
      }

      if (mode === 'resize') {
        const resized = document.createElement('canvas')
        resized.width = Math.max(1, width)
        resized.height = Math.max(1, height)
        const rctx = resized.getContext('2d')!
        rctx.imageSmoothingEnabled = true
        rctx.imageSmoothingQuality = 'high'
        if (mime === 'image/jpeg') {
          rctx.fillStyle = '#ffffff'
          rctx.fillRect(0, 0, resized.width, resized.height)
        }
        rctx.drawImage(outCanvas, 0, 0, resized.width, resized.height)
        outCanvas = resized
      }

      if (mime === 'image/jpeg' && mode === 'crop') {
        const filled = document.createElement('canvas')
        filled.width = outCanvas.width
        filled.height = outCanvas.height
        const fctx = filled.getContext('2d')!
        fctx.fillStyle = '#ffffff'
        fctx.fillRect(0, 0, filled.width, filled.height)
        fctx.drawImage(outCanvas, 0, 0)
        outCanvas = filled
      }

      const q = format === 'png' ? undefined : quality / 100
      const blob = await canvasToBlob(outCanvas, mime, q)
      const url = URL.createObjectURL(blob)
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return { blob, url, width: outCanvas.width, height: outCanvas.height }
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const outName = useMemo(() => {
    if (!src) return 'image'
    const ext = format === 'jpeg' ? 'jpg' : format
    const suffix = mode === 'resize' ? `-${width}x${height}` : mode === 'crop' ? '-cropped' : '-compressed'
    return `${baseName(src.file.name)}${suffix}.${ext}`
  }, [src, format, mode, width, height])

  const cropBox = {
    left: `${crop.x}%`,
    top: `${crop.y}%`,
    width: `${crop.w}%`,
    height: `${crop.h}%`,
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="image-resizer"
    >
      {!src ? (
        <Panel title="Choose an image">
          <Dropzone accept="image/*" multiple={false} onFiles={load} subtitle="JPG, PNG, WEBP, GIF or BMP" />
          {error && <Notice tone="error" className="mt-4">{error}</Notice>}
        </Panel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel
            title="Preview"
            description={`${src.width} × ${src.height} · ${formatBytes(src.size)}`}
            actions={
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setSrc(null)
                  setResult(null)
                }}
              >
                <RotateCcw className="h-4 w-4" /> New image
              </button>
            }
          >
            <div className="relative inline-block max-w-full overflow-hidden rounded-xl border border-surface-line">
              <img
                ref={imgRef}
                src={src.dataUrl}
                alt="Source preview"
                className="block max-h-[420px] w-auto"
              />
              {mode === 'crop' && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-ink/40" />
                  <div
                    className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(11,14,20,0.35)]"
                    style={cropBox}
                  />
                </>
              )}
            </div>

            <div className="mt-4">
              <SegmentedControl<Mode>
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'resize', label: 'Resize' },
                  { value: 'crop', label: 'Crop' },
                  { value: 'compress', label: 'Compress' },
                ]}
              />
            </div>

            {mode === 'resize' && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Labeled label="Width (px)">
                  <input
                    type="number"
                    className="field"
                    min={1}
                    max={20000}
                    value={width}
                    onChange={(e) => onWidth(Number(e.target.value))}
                  />
                </Labeled>
                <Labeled label="Height (px)">
                  <input
                    type="number"
                    className="field"
                    min={1}
                    max={20000}
                    value={height}
                    onChange={(e) => onHeight(Number(e.target.value))}
                  />
                </Labeled>
                <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-line accent-brand-600"
                    checked={lock}
                    onChange={(e) => setLock(e.target.checked)}
                  />
                  Keep aspect ratio
                </label>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  {[25, 50, 75].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="btn-soft"
                      onClick={() => {
                        const w = Math.round(src.width * (p / 100))
                        setWidth(w)
                        setHeight(Math.max(1, Math.round(w / aspect)))
                      }}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'crop' && (
              <div className="mt-5 space-y-4">
                <p className="text-xs text-ink-mute">
                  Adjust the box to choose what to keep. Values are percentages of the image.
                </p>
                <Slider label="Left edge" min={0} max={90} value={crop.x} onChange={(v) => setCrop((c) => ({ ...c, x: Math.min(v, 100 - c.w) }))} format={(v) => `${v}%`} />
                <Slider label="Top edge" min={0} max={90} value={crop.y} onChange={(v) => setCrop((c) => ({ ...c, y: Math.min(v, 100 - c.h) }))} format={(v) => `${v}%`} />
                <Slider label="Width" min={10} max={100} value={crop.w} onChange={(v) => setCrop((c) => ({ ...c, w: Math.min(v, 100 - c.x) }))} format={(v) => `${v}%`} />
                <Slider label="Height" min={10} max={100} value={crop.h} onChange={(v) => setCrop((c) => ({ ...c, h: Math.min(v, 100 - c.y) }))} format={(v) => `${v}%`} />
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Square', c: { x: 0, y: 0, w: 100, h: 100 } },
                    { label: '16:9', c: { x: 0, y: 15, w: 100, h: 70 } },
                    { label: '4:3', c: { x: 0, y: 12, w: 100, h: 76 } },
                  ].map((preset) => (
                    <button key={preset.label} type="button" className="btn-soft" onClick={() => setCrop(preset.c)}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'compress' && (
              <p className="mt-5 text-sm leading-6 text-ink-mute">
                Compression keeps the original {src.width} × {src.height} dimensions and only changes
                the encoding quality. Set the quality in the panel on the right.
              </p>
            )}
          </Panel>

          <Panel title="Output">
            <div className="space-y-5">
              <Labeled label="Format">
                <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
                  <option value="jpeg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="png">PNG (lossless)</option>
                </Select>
              </Labeled>
              {format !== 'png' && (
                <Slider
                  label="Quality"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={setQuality}
                  format={(v) => `${v}%`}
                />
              )}
              <button type="button" className="btn-primary w-full" onClick={run} disabled={busy}>
                {busy ? 'Working…' : 'Apply'}
              </button>
              {error && <Notice tone="error">{error}</Notice>}

              {result && (
                <>
                  <img
                    src={result.url}
                    alt="Result preview"
                    className="max-h-56 w-full rounded-xl border border-surface-line object-contain"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Before" value={formatBytes(src.size)} />
                    <Stat label="After" value={formatBytes(result.blob.size)} tone="brand" />
                    <Stat label="Dimensions" value={`${result.width}×${result.height}`} />
                    <Stat
                      label="Saved"
                      value={`${Math.max(0, Math.round((1 - result.blob.size / src.size) * 100))}%`}
                      tone="good"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => downloadBlob(result.blob, outName)}
                  >
                    <Download className="h-4 w-4" /> Download {outName}
                  </button>
                </>
              )}
            </div>
          </Panel>
        </div>
      )}
    </ToolShell>
  )
}
