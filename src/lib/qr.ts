import QRCode from 'qrcode'

export interface QrOptions {
  size?: number
  margin?: number
  dark?: string
  light?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export async function renderQrDataUrl(text: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options.size ?? 512,
    margin: options.margin ?? 2,
    color: { dark: options.dark ?? '#0B0E14', light: options.light ?? '#FFFFFF' },
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  })
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrOptions = {},
): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    width: options.size ?? 320,
    margin: options.margin ?? 2,
    color: { dark: options.dark ?? '#0B0E14', light: options.light ?? '#FFFFFF' },
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  })
}

/** Compose the QR with a centre logo drawn over it (higher error correction keeps it scannable). */
export async function renderQrWithLogo(
  text: string,
  logo: HTMLImageElement | null,
  options: QrOptions = {},
): Promise<string> {
  const size = options.size ?? 512
  const dataUrl = await renderQrDataUrl(text, { ...options, size, errorCorrectionLevel: 'H' })
  const base = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(base, 0, 0, size, size)
  if (logo) {
    const logoSize = size * 0.22
    const pad = size * 0.02
    const x = (size - logoSize) / 2
    const y = (size - logoSize) / 2
    ctx.fillStyle = options.light ?? '#FFFFFF'
    ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
    ctx.drawImage(logo, x, y, logoSize, logoSize)
  }
  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = src
  })
}

export function wifiPayload(ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass', hidden: boolean): string {
  const escape = (value: string) => value.replace(/([\\;,:"])/g, '\\$1')
  const parts = [`T:${security}`, `S:${escape(ssid)}`]
  if (security !== 'nopass') parts.push(`P:${escape(password)}`)
  if (hidden) parts.push('H:true')
  return `WIFI:${parts.join(';')};;`
}
