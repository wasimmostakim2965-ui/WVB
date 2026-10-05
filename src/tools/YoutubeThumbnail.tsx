import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, TextInput } from '@/components/ui/Primitives'
import { downloadUrl } from '@/lib/files'

interface Thumb {
  name: string
  label: string
  url: string
  width: number
  height: number
}

function extractId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (/^[\w-]{11}$/.test(value)) return value
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v
      const parts = url.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p))
      if (idx >= 0 && parts[idx + 1] && /^[\w-]{11}$/.test(parts[idx + 1])) return parts[idx + 1]
    }
  } catch {
    return null
  }
  return null
}

const SIZES = [
  { name: 'maxresdefault', label: 'HD 1280×720', width: 1280, height: 720 },
  { name: 'sddefault', label: 'SD 640×480', width: 640, height: 480 },
  { name: 'hqdefault', label: 'HQ 480×360', width: 480, height: 360 },
  { name: 'mqdefault', label: 'MQ 320×180', width: 320, height: 180 },
  { name: 'default', label: 'Default 120×90', width: 120, height: 90 },
]

export default function YoutubeThumbnail({ tool }: { tool: ToolMeta }) {
  const [input, setInput] = useState('')
  const [id, setId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  const search = () => {
    const parsed = extractId(input)
    if (!parsed) {
      setError('That does not look like a YouTube link. Paste a full video URL or an 11-character video ID.')
      setId(null)
      return
    }
    setError(null)
    setFailed({})
    setId(parsed)
  }

  const thumbs: Thumb[] = id
    ? SIZES.map((s) => ({
        ...s,
        url: `https://i.ytimg.com/vi/${id}/${s.name}.jpg`,
      }))
    : []

  return (
    <ToolShell
      tool={tool}
      adSlot="youtube-thumbnail"
      content={
        <>
          <h2>Download YouTube thumbnails in HD</h2>
          <p>
            Paste a YouTube video link or video ID and press <strong>Get thumbnails</strong>. Every
            available size is shown, from the 1280×720 HD image down to the small default, each with
            a download button.
          </p>
          <h2>Which link formats work?</h2>
          <ul>
            <li>Standard links: <code>youtube.com/watch?v=VIDEO_ID</code></li>
            <li>Short links: <code>youtu.be/VIDEO_ID</code></li>
            <li>Shorts: <code>youtube.com/shorts/VIDEO_ID</code></li>
            <li>Embeds and live links, or just the 11-character video ID on its own</li>
          </ul>
          <h2>What if the HD image is missing?</h2>
          <p>
            Not every video has a 1280×720 thumbnail. If the HD version is unavailable the image will
            not load; use the SD or HQ size instead, which almost always exist.
          </p>
          <p>
            Remember to respect copyright: thumbnails belong to their creators. Use them for
            reference, commentary or where you have permission.
          </p>
        </>
      }
      faqs={[
        {
          q: 'Is this tool free?',
          a: 'Yes, it is completely free and requires no account. Thumbnails are loaded directly from YouTube\'s public image servers.',
        },
        {
          q: 'Why is the HD thumbnail blank?',
          a: 'Some videos were uploaded without a 1280×720 thumbnail. In that case choose the SD or HQ size, which are nearly always available.',
        },
        {
          q: 'Can I use these thumbnails in my own videos?',
          a: 'Thumbnails are owned by their creators. Only reuse them where you have permission or where your use is allowed by law.',
        },
      ]}
    >
      <Panel title="Video link">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Labeled label="YouTube URL or video ID" className="flex-1">
            <TextInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Labeled>
          <button type="button" className="btn-primary sm:mb-0" onClick={search}>
            <Search className="h-4 w-4" /> Get thumbnails
          </button>
        </div>
        {error && <Notice tone="error" className="mt-4">{error}</Notice>}
      </Panel>

      {id && (
        <Panel className="mt-5" title="Available thumbnails">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thumbs.map((t) => (
              <div key={t.name} className="overflow-hidden rounded-xl border border-surface-line">
                <div className="grid aspect-video place-items-center bg-surface-muted">
                  {failed[t.name] ? (
                    <span className="text-xs text-ink-mute">Not available for this video</span>
                  ) : (
                    <img
                      src={t.url}
                      alt={`${t.label} thumbnail`}
                      className="h-full w-full object-cover"
                      onError={() => setFailed((f) => ({ ...f, [t.name]: true }))}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{t.label}</div>
                    <div className="font-mono text-[11px] text-ink-mute">{t.name}.jpg</div>
                  </div>
                  <button
                    type="button"
                    className="btn-soft shrink-0"
                    disabled={failed[t.name]}
                    onClick={() => downloadUrl(t.url, `${id}-${t.name}.jpg`)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </ToolShell>
  )
}
