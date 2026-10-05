import { useState } from 'react'
import { Download, FileUp, Layers, Scissors, Trash2 } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Dropzone } from '@/components/ui/Dropzone'
import { Labeled, Notice, Panel, SegmentedControl, Slider, Stat, TextInput } from '@/components/ui/Primitives'
import { formatBytes } from '@/lib/format'
import { downloadBlob, readFileAsArrayBuffer } from '@/lib/files'
import { extractPdfText, rasterizePdf } from '@/lib/pdf'

type Mode = 'merge' | 'split' | 'compress' | 'extract'

interface PdfFile {
  id: string
  file: File
  pages: number
}

export default function PdfTools({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<Mode>('merge')
  const [files, setFiles] = useState<PdfFile[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<{ blob: Blob; name: string; note?: string } | null>(null)
  const [text, setText] = useState('')
  const [range, setRange] = useState('')
  const [quality, setQuality] = useState(72)

  const addFiles = async (incoming: File[]) => {
    setError(null)
    setOutput(null)
    setText('')
    const next: PdfFile[] = []
    for (const file of incoming) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`${file.name} is not a PDF file.`)
        continue
      }
      try {
        const { PDFDocument } = await import('pdf-lib')
        const bytes = await readFileAsArrayBuffer(file)
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        next.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          pages: doc.getPageCount(),
        })
      } catch (e) {
        setError(`${file.name} could not be read: ${(e as Error).message}`)
      }
    }
    setFiles((prev) => (mode === 'merge' ? [...prev, ...next] : next.slice(0, 1)))
  }

  const runMerge = async () => {
    if (files.length < 2) {
      setError('Add at least two PDF files to merge.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()
      for (const item of files) {
        const bytes = await readFileAsArrayBuffer(item.file)
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
      }
      const out = await merged.save()
      const blob = new Blob([out as BlobPart], { type: 'application/pdf' })
      setOutput({ blob, name: 'merged.pdf', note: `${files.reduce((a, f) => a + f.pages, 0)} pages` })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const runSplit = async () => {
    if (files.length !== 1) {
      setError('Add one PDF file to split.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await readFileAsArrayBuffer(files[0].file)
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const total = doc.getPageCount()
      const indices = parseRange(range, total)
      if (!indices.length) {
        setError(`Enter page numbers between 1 and ${total}, for example 1-3,5.`)
        return
      }
      const out = await PDFDocument.create()
      const copied = await out.copyPages(doc, indices)
      copied.forEach((p) => out.addPage(p))
      const saved = await out.save()
      const blob = new Blob([saved as BlobPart], { type: 'application/pdf' })
      setOutput({ blob, name: 'split.pdf', note: `${indices.length} of ${total} pages` })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const runCompress = async () => {
    if (files.length !== 1) {
      setError('Add one PDF file to compress.')
      return
    }
    setBusy(true)
    setError(null)
    setStatus('Rendering pages…')
    try {
      const bytes = await readFileAsArrayBuffer(files[0].file)
      const out = await rasterizePdf(bytes, 1.5, quality / 100, (page, total) =>
        setStatus(`Rendering page ${page} of ${total}…`),
      )
      const blob = new Blob([out as BlobPart], { type: 'application/pdf' })
      const saved = files[0].file.size - blob.size
      setOutput({
        blob,
        name: 'compressed.pdf',
        note: saved > 0 ? `${Math.round((saved / files[0].file.size) * 100)}% smaller` : 'already optimised',
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setStatus('')
      setBusy(false)
    }
  }

  const runExtract = async () => {
    if (files.length !== 1) {
      setError('Add one PDF file to extract text from.')
      return
    }
    setBusy(true)
    setError(null)
    setText('')
    try {
      const bytes = await readFileAsArrayBuffer(files[0].file)
      const pages = await extractPdfText(bytes, (page, total) => setStatus(`Reading page ${page} of ${total}…`))
      const joined = pages
        .map((p) => (pages.length > 1 ? `--- Page ${p.page} ---\n${p.text}` : p.text))
        .join('\n\n')
      setText(joined || 'No selectable text was found. This PDF may be a scan made of images.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setStatus('')
      setBusy(false)
    }
  }

  const run = () => {
    if (mode === 'merge') return runMerge()
    if (mode === 'split') return runSplit()
    if (mode === 'compress') return runCompress()
    return runExtract()
  }

  const single = mode !== 'merge'

  return (
    <ToolShell
      tool={tool}
      adSlot="pdf-tools"
      content={
        <>
          <h2>Merge, split, compress and read PDFs</h2>
          <p>
            Pick a mode above, add your PDF files and press the action button. Everything is
            processed in your browser, so your documents are never uploaded.
          </p>
          <h2>What each mode does</h2>
          <ul>
            <li><strong>Merge</strong> — combines several PDFs into one, in the order shown.</li>
            <li><strong>Split</strong> — keeps only the pages you list, for example <code>1-3,5,8-10</code>.</li>
            <li><strong>Compress</strong> — re-renders pages as images to reduce file size, best for scanned documents.</li>
            <li><strong>Extract text</strong> — pulls selectable text out of a PDF so you can copy or reuse it.</li>
          </ul>
          <h2>A note on compression</h2>
          <p>
            Compression works by rendering each page as an image, so the text is no longer
            selectable in the output. It gives the biggest savings on scanned, image-heavy files. For
            text documents the saving may be small.
          </p>
        </>
      }
      faqs={[
        {
          q: 'Are my PDFs uploaded to a server?',
          a: 'No. Merging, splitting, compressing and text extraction all run locally in your browser, so your documents stay on your device.',
        },
        {
          q: 'How do I select specific pages to split?',
          a: 'Enter a range such as 1-3,5,8-10 in the pages field. Use commas between ranges and hyphens for a span of pages.',
        },
        {
          q: 'Why did compression make my file smaller but not editable?',
          a: 'Compression renders each page as an image, which shrinks image-heavy PDFs but removes selectable text. Keep the original if you need to edit it later.',
        },
      ]}
    >
      <div className="mb-5">
        <SegmentedControl<Mode>
          value={mode}
          onChange={(m) => {
            setMode(m)
            setFiles([])
            setOutput(null)
            setText('')
            setError(null)
          }}
          options={[
            { value: 'merge', label: 'Merge' },
            { value: 'split', label: 'Split' },
            { value: 'compress', label: 'Compress' },
            { value: 'extract', label: 'Extract text' },
          ]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title={single ? 'PDF file' : 'PDF files'}
          description={single ? 'Add one PDF file' : 'Add two or more PDFs, in the order you want'}
        >
          <Dropzone
            accept="application/pdf,.pdf"
            multiple={!single}
            onFiles={addFiles}
            icon={<FileUp className="h-5.5 w-5.5" />}
            subtitle="PDF only · processed in your browser"
          />
          {error && <Notice tone="error" className="mt-4">{error}</Notice>}

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((f, i) => (
                <li key={f.id} className="flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-muted text-xs font-bold text-ink-mute">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{f.file.name}</div>
                    <div className="text-xs text-ink-mute">
                      {f.pages} page{f.pages === 1 ? '' : 's'} · {formatBytes(f.file.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${f.file.name}`}
                    className="btn-soft shrink-0 px-2.5 py-1.5"
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Action">
          {mode === 'split' && (
            <Labeled label="Pages to keep" hint="e.g. 1-3,5">
              <TextInput value={range} onChange={(e) => setRange(e.target.value)} placeholder="1-3,5" />
            </Labeled>
          )}
          {mode === 'compress' && (
            <div className="mb-4">
              <Slider
                label="Image quality"
                min={30}
                max={95}
                value={quality}
                onChange={setQuality}
                format={(v) => `${v}%`}
              />
              <p className="mt-2 text-xs text-ink-mute">
                Lower quality gives a smaller file. Around 70% is usually a good balance.
              </p>
            </div>
          )}

          <button type="button" className="btn-primary w-full" onClick={run} disabled={busy || files.length === 0}>
            {busy ? (
              status || 'Working…'
            ) : (
              <>
                {mode === 'merge' && <Layers className="h-4 w-4" />}
                {mode === 'split' && <Scissors className="h-4 w-4" />}
                {mode === 'compress' && <Download className="h-4 w-4" />}
                {mode === 'extract' && <FileUp className="h-4 w-4" />}
                {mode === 'merge' && 'Merge PDFs'}
                {mode === 'split' && 'Split PDF'}
                {mode === 'compress' && 'Compress PDF'}
                {mode === 'extract' && 'Extract text'}
              </>
            )}
          </button>

          {busy && status && <Notice className="mt-3">{status}</Notice>}

          {output && (
            <div className="mt-5 space-y-3">
              <Stat label="Result" value={output.name} sub={output.note} tone="brand" />
              <Stat label="Size" value={formatBytes(output.blob.size)} />
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => downloadBlob(output.blob, output.name)}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          )}

          {text && (
            <div className="mt-5">
              <Labeled label="Extracted text">
                <textarea
                  readOnly
                  value={text}
                  rows={12}
                  className="field font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </Labeled>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-soft flex-1"
                  onClick={() => navigator.clipboard.writeText(text)}
                >
                  Copy text
                </button>
                <button
                  type="button"
                  className="btn-soft flex-1"
                  onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), 'extracted.txt')}
                >
                  Download .txt
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}

function parseRange(input: string, total: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) return Array.from({ length: total }, (_, i) => i)
  const indices = new Set<number>()
  for (const part of trimmed.split(',')) {
    const piece = part.trim()
    if (!piece) continue
    const match = piece.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = Math.max(1, Number(match[1]))
      const end = Math.min(total, Number(match[2]))
      for (let i = start; i <= end; i++) indices.add(i - 1)
    } else if (/^\d+$/.test(piece)) {
      const n = Number(piece)
      if (n >= 1 && n <= total) indices.add(n - 1)
    }
  }
  return [...indices].sort((a, b) => a - b)
}
