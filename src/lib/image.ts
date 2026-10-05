export type CanvasImage = {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

/** Decode a file into a canvas, honouring EXIF orientation where the browser does. */
export async function fileToCanvas(file: File): Promise<CanvasImage> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(url)
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available in this browser')
    ctx.drawImage(img, 0, 0, width, height)
    return { canvas, width, height }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The image could not be decoded'))
    img.src = src
  })
}

const supportCache = new Map<string, boolean>()

export function supportsMime(type: string): boolean {
  if (supportCache.has(type)) return supportCache.get(type)!
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ok = canvas.toDataURL(type).startsWith(`data:${type}`)
  supportCache.set(type, ok)
  return ok
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Could not encode as ${type}`))),
      type,
      quality,
    )
  })
}

/** Minimal 24-bit BMP encoder, used because browsers cannot export BMP from a canvas. */
export function canvasToBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height).data
  const rowSize = Math.floor((24 * width + 31) / 32) * 4
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize
  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)

  view.setUint8(0, 0x42)
  view.setUint8(1, 0x4d)
  view.setUint32(2, fileSize, true)
  view.setUint32(10, 54, true)
  view.setUint32(14, 40, true)
  view.setInt32(18, width, true)
  view.setInt32(22, height, true)
  view.setUint16(26, 1, true)
  view.setUint16(28, 24, true)
  view.setUint32(34, pixelArraySize, true)
  view.setInt32(38, 2835, true)
  view.setInt32(42, 2835, true)

  let offset = 54
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      view.setUint8(offset++, imageData[i + 2])
      view.setUint8(offset++, imageData[i + 1])
      view.setUint8(offset++, imageData[i])
    }
    offset += rowSize - width * 3
  }
  return new Blob([buffer], { type: 'image/bmp' })
}

export function renameExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^./\\]+$/, '')
  return `${base || 'image'}.${ext}`
}

export function baseName(name: string): string {
  return name.replace(/\.[^./\\]+$/, '') || 'image'
}
