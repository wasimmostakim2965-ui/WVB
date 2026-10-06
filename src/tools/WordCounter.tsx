import { useMemo, useState } from 'react'
import { Eraser, Upload } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { CopyButton, Notice, Panel, Stat, TextArea } from '@/components/ui/Primitives'
import { readFileAsText } from '@/lib/files'

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab'

function toTitleCase(text: string): string {
  const small = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'as', 'is', 'it'])
  return text
    .toLowerCase()
    .replace(/\b\w+/g, (word, offset: number) => {
      if (offset !== 0 && small.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase())
}

function toCamelCase(text: string): string {
  const words = text.split(/[^A-Za-z0-9]+/).filter(Boolean)
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
}

function words(text: string): string[] {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean) : []
}

export default function WordCounter({ tool }: { tool: ToolMeta }) {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const list = words(text)
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || (text.trim() ? [text.trim()] : [])).length
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).length
    const readingMinutes = list.length / 225
    const speakingMinutes = list.length / 130
    const longest = list.reduce((a, w) => (w.length > a.length ? w : a), '')
    const unique = new Set(list.map((w) => w.toLowerCase())).size

    const freq = new Map<string, number>()
    for (const w of list) {
      const key = w.toLowerCase().replace(/[^a-z0-9'-]/g, '')
      if (!key || key.length < 3) continue
      freq.set(key, (freq.get(key) ?? 0) + 1)
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    return { list, chars, charsNoSpaces, sentences, paragraphs, readingMinutes, speakingMinutes, longest, unique, top }
  }, [text])

  const applyCase = (mode: CaseMode) => {
    const map: Record<CaseMode, (t: string) => string> = {
      upper: (t) => t.toUpperCase(),
      lower: (t) => t.toLowerCase(),
      title: toTitleCase,
      sentence: toSentenceCase,
      camel: toCamelCase,
      snake: (t) => t.trim().split(/[^A-Za-z0-9]+/).filter(Boolean).join('_').toLowerCase(),
      kebab: (t) => t.trim().split(/[^A-Za-z0-9]+/).filter(Boolean).join('-').toLowerCase(),
    }
    setText(map[mode](text))
  }

  const readMinutes = (m: number) => (m < 1 ? `${Math.max(1, Math.round(m * 60))} sec` : `${m.toFixed(1)} min`)

  return (
    <ToolShell
      tool={tool}
      adSlot="word-counter"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Panel
          title="Your text"
          actions={
            <div className="flex gap-2">
              <label className="btn-ghost cursor-pointer">
                <Upload className="h-4 w-4" /> Upload
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) setText(await readFileAsText(file))
                  }}
                />
              </label>
              <button type="button" className="btn-ghost" onClick={() => setText('')}>
                <Eraser className="h-4 w-4" /> Clear
              </button>
            </div>
          }
        >
          <TextArea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ['upper', 'UPPERCASE'],
                ['lower', 'lowercase'],
                ['title', 'Title Case'],
                ['sentence', 'Sentence case'],
                ['camel', 'camelCase'],
                ['snake', 'snake_case'],
                ['kebab', 'kebab-case'],
              ] as [CaseMode, string][]
            ).map(([mode, label]) => (
              <button key={mode} type="button" className="btn-soft" onClick={() => applyCase(mode)} disabled={!text}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <CopyButton value={text} label="Copy text" />
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Counts">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={stats.list.length} tone="brand" />
              <Stat label="Characters" value={stats.chars} />
              <Stat label="No spaces" value={stats.charsNoSpaces} />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paragraphs} />
              <Stat label="Unique words" value={stats.unique} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="Reading time" value={readMinutes(stats.readingMinutes)} />
              <Stat label="Speaking time" value={readMinutes(stats.speakingMinutes)} />
            </div>
          </Panel>

          <Panel title="Most used words">
            {stats.top.length === 0 ? (
              <p className="text-sm text-ink-mute">Add some text to see the most common words.</p>
            ) : (
              <ul className="space-y-2">
                {stats.top.map(([word, count]) => {
                  const pct = stats.list.length ? (count / stats.list.length) * 100 : 0
                  return (
                    <li key={word}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium text-ink">{word}</span>
                        <span className="text-ink-mute">
                          {count} · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-line">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, pct * 4)}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {stats.longest && (
              <Notice className="mt-4">
                Longest word: <strong>{stats.longest}</strong> ({stats.longest.length} characters)
              </Notice>
            )}
          </Panel>
        </div>
      </div>
    </ToolShell>
  )
}
