import { useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, SegmentedControl, TextInput } from '@/components/ui/Primitives'
import { wifiPayload } from '@/lib/qr'
import QRCode from 'qrcode'

type Security = 'WPA' | 'WEP' | 'nopass'

export default function WifiQr({ tool }: { tool: ToolMeta }) {
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [security, setSecurity] = useState<Security>('WPA')
  const [hidden, setHidden] = useState(false)
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ssid.trim()) {
      setDataUrl('')
      return
    }
    if (security !== 'nopass' && !password) {
      setDataUrl('')
      setError(null)
      return
    }
    const payload = wifiPayload(ssid.trim(), password, security, hidden)
    QRCode.toDataURL(payload, { width: 640, margin: 2, errorCorrectionLevel: 'M' })
      .then((url) => {
        setDataUrl(url)
        setError(null)
      })
      .catch((e) => setError((e as Error).message))
  }, [ssid, password, security, hidden])

  const print = () => {
    if (!dataUrl) return
    const w = window.open('', '_blank', 'width=520,height=680')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>WiFi QR — ${ssid}</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#0B0E14}
      img{width:320px;height:320px;margin:16px auto}
      h1{font-size:20px;margin:0} .pw{font-family:ui-monospace,monospace;font-size:18px;margin-top:6px}
      p{color:#6B7280;font-size:13px}</style></head>
      <body onload="window.print()">
      <h1>WiFi network</h1>
      <div class="pw">${ssid.replace(/[<>&]/g, '')}</div>
      <img src="${dataUrl}" alt="WiFi QR code" />
      <p>Scan this code with your phone camera to join the network.</p>
      ${security !== 'nopass' ? `<div class="pw">Password: ${password.replace(/[<>&]/g, '')}</div>` : ''}
      <p>Security: ${security}</p>
      </body></html>`)
    w.document.close()
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="wifi-qr"
      content={
        <>
          <h2>Share your WiFi with a QR code</h2>
          <p>
            Type your network name and password and a QR code appears. Anyone can point their phone
            camera at it to join the network without typing the password, which is much easier than
            reading it aloud to guests.
          </p>
          <h2>How to scan it</h2>
          <ul>
            <li><strong>iPhone:</strong> open the Camera app and hold it over the code, then tap the notification that appears.</li>
            <li><strong>Android:</strong> open the Camera or Google Lens, or use the WiFi settings scan option.</li>
          </ul>
          <h2>Is it safe?</h2>
          <p>
            The QR code contains your WiFi password in plain text, exactly as the network standard
            defines. Only show it to people you trust, and treat a printed copy the way you would
            treat the password itself. The code is generated in your browser and never uploaded.
          </p>
        </>
      }
      faqs={[
        {
          q: 'Does this work on both iPhone and Android?',
          a: 'Yes. Modern iPhones and Android phones can join a network by scanning a standard WiFi QR code with their camera.',
        },
        {
          q: 'What does the "hidden network" option do?',
          a: 'Tick it if your router does not broadcast its network name. The code then tells the phone that the network is hidden so it can still connect.',
        },
        {
          q: 'Can I print the code for guests?',
          a: 'Yes. Use the print button to open a clean, printable card with the network name, the QR code and the password.',
        },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Network details">
          <div className="space-y-4">
            <Labeled label="Network name (SSID)">
              <TextInput value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyHomeWiFi" />
            </Labeled>
            <Labeled label="Security type">
              <SegmentedControl
                value={security}
                onChange={(v) => setSecurity(v)}
                options={[
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'Open' },
                ]}
              />
            </Labeled>
            {security !== 'nopass' && (
              <Labeled label="Password">
                <TextInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your WiFi password"
                  autoComplete="off"
                />
              </Labeled>
            )}
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-line accent-brand-600"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
              />
              The network is hidden
            </label>
            {error && <Notice tone="error">{error}</Notice>}
            {!ssid.trim() && <Notice tone="info">Enter a network name to generate the code.</Notice>}
          </div>
        </Panel>

        <Panel title="Your WiFi QR code">
          {dataUrl ? (
            <div className="text-center">
              <img
                src={dataUrl}
                alt={`WiFi QR code for ${ssid}`}
                className="mx-auto w-full max-w-[320px] rounded-2xl border border-surface-line"
              />
              <div className="mt-4 font-display text-lg font-bold text-ink">{ssid}</div>
              {security !== 'nopass' && (
                <div className="font-mono text-sm text-ink-mute">{password}</div>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                  href={dataUrl}
                  download={`wifi-qr-${ssid.replace(/[^\w-]+/g, '_')}.png`}
                  className="btn-primary"
                >
                  <Download className="h-4 w-4" /> Download PNG
                </a>
                <button type="button" className="btn-ghost" onClick={print}>
                  <Printer className="h-4 w-4" /> Print card
                </button>
              </div>
            </div>
          ) : (
            <div className="grid h-72 place-items-center rounded-xl border border-dashed border-surface-line text-sm text-ink-mute">
              Your QR code will appear here
            </div>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}
