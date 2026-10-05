import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjsLib }

export interface ExtractedPage {
  page: number
  text: string
}

export async function extractPdfText(
  data: ArrayBuffer,
  onProgress?: (page: number, total: number) => void,
): Promise<ExtractedPage[]> {
  const doc = await pdfjsLib.getDocument({ data }).promise
  const out: ExtractedPage[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    out.push({ page: i, text })
    onProgress?.(i, doc.numPages)
  }
  await doc.destroy()
  return out
}

/** Render every page to a JPEG canvas and reassemble, which shrinks image-heavy PDFs. */
export async function rasterizePdf(
  data: ArrayBuffer,
  scale: number,
  quality: number,
  onProgress?: (page: number, total: number) => void,
): Promise<Uint8Array> {
  const doc = await pdfjsLib.getDocument({ data }).promise
  const { PDFDocument } = await import('pdf-lib')
  const out = await PDFDocument.create()

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(viewport.width))
    canvas.height = Math.max(1, Math.floor(viewport.height))
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Render failed'))), 'image/jpeg', quality),
    )
    const bytes = new Uint8Array(await blob.arrayBuffer())
    const embedded = await out.embedJpg(bytes)
    const pageWidth = viewport.width / scale
    const pageHeight = viewport.height / scale
    const pdfPage = out.addPage([pageWidth, pageHeight])
    pdfPage.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight })
    onProgress?.(i, doc.numPages)
  }
  await doc.destroy()
  return out.save()
}
