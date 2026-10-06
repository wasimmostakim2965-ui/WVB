import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, Download, Image as ImageIcon, QrCode as QrIcon, ScanLine } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Dropzone } from '@/components/ui/Dropzone'
import { Labeled, Notice, Panel, SegmentedControl, Slider, TextArea, TextInput } from '@/components/ui/Primitives'
import { renderQrWithLogo } from '@/lib/qr'
import { loadImageElement } from '@/lib/image'
import { readFileAsDataURL } from '@/lib/files'

type Mode = 'create' | 'scan'
type Kind = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi'

function buildPayload(kind: Kind, fields: Record<string, string>): string {
  switch (kind) {
    case 'url':
      return fields.url ? (/^https?:\/\//i.test(fields.url) ? fields.url : `https://${fields.url}`) : ''
    case 'email':
      return fields.email ? `mailto:${fields.email}${fields.subject ? `?subject=${encodeURIComponent(fields.subject)}` : ''}` : ''
    case 'phone':
      return fields.phone ? `tel:${fields.phone}` : ''
    case 'sms':
      return fields.phone ? `SMSTO:${fields.phone}:${fields.message ?? ''}` : ''
    case 'wifi':
      if (!fields.ssid) return ''
      return `WIFI:T:${fields.security || 'WPA'};S:${fields.ssid};P:${fields.password ?? ''};;`
    default:
      return fields.text ?? ''
  }
}

export default function QrCodeTool({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<Mode>('create')
  const [kind, setKind] = useState<Kind>('text')
  const [fields, setFields] = useState<Record<string, string>>({ text: 'https://wvbtools.com' })
  const [size, setSize] = useState(512)
  const [dark, setDark] = useState('#0B0E14')
  const [light, setLight] = useState('#FFFFFF')
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>()
  const scanCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))

  const payload = buildPayload(kind, fields)

  useEffect(() => {
    if (!payload) {
      setQrUrl('')
      return
    }
    let cancelled = false
    renderQrWithLogo(payload, logo, { size, dark, light })
      .then((url) => !cancelled && setQrUrl(url))
      .catch((e) => !cancelled && setError((e as Error).message))
    return () => {
      cancelled = true
    }
  }, [payload, logo, size, dark, light])

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setCameraOn(false)
  }

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = scanCanvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const found = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
    if (found?.data) {
      setScanResult(found.data)
      setScanError(null)
      stopCamera()
      return
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }

  const startCamera = async () => {
    setScanError(null)
    setScanResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch (e) {
      setScanError(
        (e as Error).message || 'The camera could not be started. Check your browser permissions.',
      )
    }
  }

  const scanImage = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setScanError(null)
    setScanResult(null)
    try {
      const url = await readFileAsDataURL(file)
      const img = await loadImageElement(url)
      const canvas = scanCanvasRef.current
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const found = jsQR(image.data, image.width, image.height)
      if (found?.data) setScanResult(found.data)
      else setScanError('No QR code was found in that image. Try a sharper or closer photo.')
    } catch (e) {
      setScanError((e as Error).message)
    }
  }

  const fieldDefs: Record<Kind, { key: string; label: string; placeholder?: string; area?: boolean }[]> = {
    text: [{ key: 'text', label: 'Text', placeholder: 'Any text you like', area: true }],
    url: [{ key: 'url', label: 'Website URL', placeholder: 'example.com' }],
    email: [
      { key: 'email', label: 'Email address', placeholder: 'hello@example.com' },
      { key: 'subject', label: 'Subject (optional)', placeholder: 'Hello' },
    ],
    phone: [{ key: 'phone', label: 'Phone number', placeholder: '+1 555 0100' }],
    sms: [
      { key: 'phone', label: 'Phone number', placeholder: '+1 555 0100' },
      { key: 'message', label: 'Message (optional)', placeholder: 'Hi there' },
    ],
    wifi: [
      { key: 'ssid', label: 'Network name (SSID)', placeholder: 'MyHomeWiFi' },
      { key: 'password', label: 'Password', placeholder: 'Network password' },
    ],
  }

  return (
    <ToolShell
      tool={tool}
    >
      <div className="mb-5">
        <SegmentedControl<Mode>
          value={mode}
          onChange={(m) => {
            setMode(m)
            if (m === 'scan') stopCamera()
          }}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'scan', label: 'Scan' },
          ]}
        />
      </div>

      {mode === 'create' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Content">
            <div className="space-y-4">
              <Labeled label="Type of code">
                <SegmentedControl<Kind>
                  value={kind}
                  onChange={(k) => {
                    setKind(k)
                    setFields(k === 'text' ? { text: 'https://wvbtools.com' } : {})
                  }}
                  options={[
                    { value: 'url', label: 'Link' },
                    { value: 'text', label: 'Text' },
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'wifi', label: 'WiFi' },
                  ]}
                />
              </Labeled>
              {fieldDefs[kind].map((f) =>
                f.area ? (
                  <Labeled key={f.key} label={f.label}>
                    <TextArea
                      rows={4}
                      value={fields[f.key] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </Labeled>
                ) : (
                  <Labeled key={f.key} label={f.label}>
                    <TextInput
                      value={fields[f.key] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </Labeled>
                ),
              )}
              {kind === 'wifi' && (
                <Labeled label="WiFi security">
                  <SegmentedControl
                    value={fields.security ?? 'WPA'}
                    onChange={(v) => setFields((prev) => ({ ...prev, security: v }))}
                    options={[
                      { value: 'WPA', label: 'WPA/WPA2' },
                      { value: 'WEP', label: 'WEP' },
                      { value: 'nopass', label: 'Open' },
                    ]}
                  />
                </Labeled>
              )}
            </div>
          </Panel>

          <Panel title="Design & preview">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Labeled label="Foreground">
                  <input
                    type="color"
                    value={dark}
                    onChange={(e) => setDark(e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-xl border border-surface-line bg-white p-1"
                  />
                </Labeled>
                <Labeled label="Background">
                  <input
                    type="color"
                    value={light}
                    onChange={(e) => setLight(e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-xl border border-surface-line bg-white p-1"
                  />
                </Labeled>
              </div>
              <Slider label="Size" min={256} max={1024} step={64} value={size} onChange={setSize} format={(v) => `${v}px`} />
              <label className="btn-ghost w-full cursor-pointer">
                <ImageIcon className="h-4 w-4" /> {logo ? 'Change logo' : 'Add a centre logo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    try {
                      setLogo(await loadImageElement(await readFileAsDataURL(file)))
                    } catch {
                      setError('That logo could not be loaded.')
                    }
                  }}
                />
              </label>
              {logo && (
                <button type="button" className="btn-soft w-full" onClick={() => setLogo(null)}>
                  Remove logo
                </button>
              )}
              {error && <Notice tone="error">{error}</Notice>}

              <div className="grid place-items-center rounded-xl border border-surface-line bg-surface-muted/40 p-5">
                {qrUrl ? (
                  <img src={qrUrl} alt="Generated QR code" className="w-full max-w-[260px]" />
                ) : (
                  <div className="grid h-56 w-56 place-items-center text-center text-xs text-ink-mute">
                    <span>
                      <QrIcon className="mx-auto mb-2 h-8 w-8 text-ink-mute/60" />
                      Fill in the fields to see your code
                    </span>
                  </div>
                )}
              </div>
              {qrUrl && (
                <a href={qrUrl} download={`qr-${kind}-${Date.now()}.png`} className="btn-primary w-full">
                  <Download className="h-4 w-4" /> Download PNG
                </a>
              )}
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Scan with camera">
            <div className="relative overflow-hidden rounded-xl border border-surface-line bg-ink">
              <video ref={videoRef} className="aspect-square w-full object-cover" playsInline muted />
              {!cameraOn && (
                <div className="absolute inset-0 grid place-items-center text-center text-xs text-white/70">
                  <span>
                    <ScanLine className="mx-auto mb-2 h-8 w-8" />
                    Camera preview
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              {cameraOn ? (
                <button type="button" className="btn-ghost flex-1" onClick={stopCamera}>
                  Stop camera
                </button>
              ) : (
                <button type="button" className="btn-primary flex-1" onClick={startCamera}>
                  <Camera className="h-4 w-4" /> Start camera
                </button>
              )}
            </div>
            {scanError && <Notice tone="warn" className="mt-3">{scanError}</Notice>}
          </Panel>

          <Panel title="Scan from an image">
            <Dropzone
              accept="image/*"
              multiple={false}
              onFiles={scanImage}
              subtitle="Upload a screenshot or photo containing a QR code"
            />
            {scanResult && (
              <div className="mt-5">
                <Labeled label="Result">
                  <textarea readOnly value={scanResult} rows={5} className="field font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                </Labeled>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn-soft" onClick={() => navigator.clipboard.writeText(scanResult)}>
                    Copy
                  </button>
                  {/^https?:\/\//i.test(scanResult) && (
                    <a href={scanResult} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      Open link
                    </a>
                  )}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </ToolShell>
  )
}
