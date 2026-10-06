import { useState } from 'react'
import { Download, Wand2 } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Dropzone } from '@/components/ui/Dropzone'
import { Notice, Panel, Stat } from '@/components/ui/Primitives'
import { formatBytes } from '@/lib/format'
import { baseName } from '@/lib/image'
import { downloadBlob, readFileAsDataURL } from '@/lib/files'

export default function BackgroundRemover({ tool }: { tool: ToolMeta }) {
  const [original, setOriginal] = useState<{ file: File; url: string } | null>(null)
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setError(null)
    setResult(null)
    const url = await readFileAsDataURL(file)
    setOriginal({ file, url })
  }

  const remove = async () => {
    if (!original) return
    setBusy(true)
    setError(null)
    setProgress('Loading the AI model (first run only)…')
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      setProgress('Removing the background…')
      const blob = await removeBackground(original.file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(`Downloading model… ${Math.round((current / total) * 100)}%`)
          else setProgress(key)
        },
      })
      const url = URL.createObjectURL(blob)
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return { blob, url }
      })
      setProgress('')
    } catch (e) {
      setError(
        (e as Error).message ||
          'Background removal failed. Try a smaller image or a browser with WebAssembly support.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="background-remover"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Original image">
          <Dropzone accept="image/*" multiple={false} onFiles={load} subtitle="JPG, PNG or WEBP" />
          {original && (
            <div className="mt-4">
              <div
                className="overflow-hidden rounded-xl border border-surface-line"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
                }}
              >
                <img src={original.url} alt="Original" className="mx-auto max-h-80 w-auto" />
              </div>
              <div className="mt-3 text-xs text-ink-mute">
                {original.file.name} · {formatBytes(original.file.size)}
              </div>
              <button type="button" className="btn-primary mt-4 w-full" onClick={remove} disabled={busy}>
                <Wand2 className="h-4 w-4" />
                {busy ? 'Working…' : 'Remove background'}
              </button>
              {busy && <Notice className="mt-3">{progress || 'Working…'}</Notice>}
              {error && <Notice tone="error" className="mt-3">{error}</Notice>}
            </div>
          )}
        </Panel>

        <Panel title="Result" description="Transparent PNG">
          {result ? (
            <>
              <div
                className="overflow-hidden rounded-xl border border-surface-line"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
                }}
              >
                <img src={result.url} alt="Background removed" className="mx-auto max-h-80 w-auto" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Original size" value={original ? formatBytes(original.file.size) : '—'} />
                <Stat label="Result size" value={formatBytes(result.blob.size)} tone="brand" />
              </div>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={() =>
                  original && downloadBlob(result.blob, `${baseName(original.file.name)}-no-bg.png`)
                }
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
            </>
          ) : (
            <div className="grid h-64 place-items-center rounded-xl border border-dashed border-surface-line text-sm text-ink-mute">
              The result will appear here
            </div>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}
