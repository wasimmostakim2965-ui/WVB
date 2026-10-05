import { useState } from 'react'
import { Check, Copy, Download, Eraser, Sparkles, Zap } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Notice, Panel, SegmentedControl, Stat, TextArea } from '@/components/ui/Primitives'
import { formatBytes } from '@/lib/format'
import { downloadText } from '@/lib/files'

type Lang = 'json' | 'js' | 'css' | 'html'
type Action = 'beautify' | 'minify'

const SAMPLE: Record<Lang, string> = {
  json: '{"name":"WVB Tools","tools":20,"tags":["fast","private"],"nested":{"a":1,"b":[2,3]}}',
  js: 'function greet(name){const msg="Hello, "+name+"!";if(name){console.log(msg)}else{console.log("Hi!")}return msg}',
  css: 'body{margin:0;padding:0;font-family:sans-serif;color:#111}.btn{display:inline-flex;gap:8px;padding:10px 16px;border-radius:12px;background:#345ef5;color:#fff}',
  html: '<div class="card"><h1>Hello</h1><p>Some text here</p><ul><li>One</li><li>Two</li></ul></div>',
}

async function beautify(code: string, lang: Lang): Promise<string> {
  const prettier = await import('prettier/standalone')
  const plugins = [
    (await import('prettier/plugins/estree')).default,
    (await import('prettier/plugins/babel')).default,
    (await import('prettier/plugins/html')).default,
    (await import('prettier/plugins/postcss')).default,
  ]
  const parser = lang === 'json' ? 'json' : lang === 'js' ? 'babel' : lang === 'css' ? 'css' : 'html'
  return prettier.format(code, {
    parser,
    plugins,
    printWidth: 90,
    semi: true,
    singleQuote: true,
  })
}

function minifyCss(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+/g, ' ')
    .trim()
}

function minifyHtml(code: string): string {
  return code
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/\s*\/>/g, '/>')
    .trim()
}

async function minify(code: string, lang: Lang): Promise<string> {
  if (lang === 'json') return JSON.stringify(JSON.parse(code))
  if (lang === 'css') return minifyCss(code)
  if (lang === 'html') return minifyHtml(code)
  const { minify: terserMinify } = await import('terser')
  const result = await terserMinify(code, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false },
  })
  return result.code ?? ''
}

export default function CodeFormatter({ tool }: { tool: ToolMeta }) {
  const [lang, setLang] = useState<Lang>('json')
  const [action, setAction] = useState<Action>('beautify')
  const [input, setInput] = useState(SAMPLE.json)
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setBusy(true)
    setError(null)
    setOutput('')
    try {
      const result = action === 'beautify' ? await beautify(input, lang) : await minify(input, lang)
      setOutput(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const switchLang = (next: Lang) => {
    setLang(next)
    setInput(SAMPLE[next])
    setOutput('')
    setError(null)
  }

  const savedPct =
    output && input
      ? Math.round((1 - new Blob([output]).size / new Blob([input]).size) * 100)
      : 0

  return (
    <ToolShell
      tool={tool}
      adSlot="code-formatter"
      content={
        <>
          <h2>Format, beautify and minify code</h2>
          <p>
            Choose a language — JSON, JavaScript, CSS or HTML — paste your code and press the action
            button. <strong>Beautify</strong> adds indentation and line breaks to make code readable.{' '}
            <strong>Minify</strong> removes everything unnecessary to make the file as small as
            possible for a live website.
          </p>
          <h2>When to use each one</h2>
          <ul>
            <li><strong>Beautify</strong> when you receive compressed code and need to read or edit it.</li>
            <li><strong>Minify</strong> before publishing, to reduce download size and speed up a page.</li>
            <li><strong>Validate JSON</strong> by beautifying it: invalid JSON shows an error with the position.</li>
          </ul>
          <h2>Is my code uploaded?</h2>
          <p>
            No. Formatting and minifying happen entirely in your browser. That matters if your code
            contains keys, internal URLs or anything you would rather not send to a stranger's
            server.
          </p>
        </>
      }
      faqs={[
        {
          q: 'Can this tool find errors in my JSON?',
          a: 'Yes. If the JSON is invalid, beautifying it reports the problem so you can fix it. Valid JSON is reformatted with proper indentation.',
        },
        {
          q: 'Is my code sent to a server?',
          a: 'No. Everything runs locally in your browser, so your code and any secrets in it never leave your device.',
        },
        {
          q: 'Will minifying break my JavaScript?',
          a: 'Minification renames local variables and removes whitespace, which is safe for standard code. Code that relies on function names via reflection can behave differently, so always test the minified output.',
        },
      ]}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SegmentedControl<Lang>
          value={lang}
          onChange={switchLang}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'js', label: 'JavaScript' },
            { value: 'css', label: 'CSS' },
            { value: 'html', label: 'HTML' },
          ]}
        />
        <SegmentedControl<Action>
          value={action}
          onChange={setAction}
          options={[
            { value: 'beautify', label: 'Beautify' },
            { value: 'minify', label: 'Minify' },
          ]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Input"
          actions={
            <button type="button" className="btn-ghost" onClick={() => { setInput(''); setOutput('') }}>
              <Eraser className="h-4 w-4" /> Clear
            </button>
          }
        >
          <TextArea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-xs"
            spellCheck={false}
            placeholder={`Paste your ${lang.toUpperCase()} here…`}
          />
          <button type="button" className="btn-primary mt-4 w-full" onClick={run} disabled={busy || !input.trim()}>
            {busy ? (
              'Working…'
            ) : action === 'beautify' ? (
              <>
                <Sparkles className="h-4 w-4" /> Beautify {lang.toUpperCase()}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Minify {lang.toUpperCase()}
              </>
            )}
          </button>
          {error && <Notice tone="error" className="mt-4">{error}</Notice>}
        </Panel>

        <Panel
          title="Result"
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={!output}
                onClick={async () => {
                  await navigator.clipboard.writeText(output)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={!output}
                onClick={() => downloadText(output, `formatted.${lang === 'js' ? 'js' : lang === 'json' ? 'json' : lang}`)}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          }
        >
          <TextArea
            rows={16}
            value={output}
            readOnly
            className="font-mono text-xs"
            placeholder="Your formatted code will appear here"
            onFocus={(e) => e.currentTarget.select()}
          />
          {output && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Input" value={formatBytes(new Blob([input]).size)} />
              <Stat label="Output" value={formatBytes(new Blob([output]).size)} tone="brand" />
              <Stat
                label={action === 'minify' ? 'Reduced' : 'Lines'}
                value={action === 'minify' ? `${Math.max(0, savedPct)}%` : String(output.split('\n').length)}
                tone="good"
              />
            </div>
          )}
        </Panel>
      </div>
    </ToolShell>
  )
}
