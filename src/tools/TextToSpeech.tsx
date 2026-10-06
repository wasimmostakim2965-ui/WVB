import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, Select, Slider, Stat, TextArea } from '@/components/ui/Primitives'

export default function TextToSpeech({ tool }: { tool: ToolMeta }) {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices()
      if (list.length) {
        setVoices(list)
        setVoiceName((prev) => prev || list.find((v) => v.lang.startsWith('en'))?.name || list[0].name)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.cancel()
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const selectedVoice = useMemo(() => voices.find((v) => v.name === voiceName), [voices, voiceName])

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const estimate = words / (150 * rate)

  const speak = () => {
    if (!text.trim() || !supported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    if (selectedVoice) utter.voice = selectedVoice
    utter.rate = rate
    utter.pitch = pitch
    utter.volume = volume
    utter.onend = () => {
      setSpeaking(false)
      setPaused(false)
    }
    utter.onerror = () => {
      setSpeaking(false)
      setPaused(false)
    }
    window.speechSynthesis.speak(utter)
    setSpeaking(true)
    setPaused(false)
  }

  const pause = () => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
    } else {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="text-to-speech"
    >
      {!supported && (
        <Notice tone="warn" className="mb-5">
          Your browser does not support speech synthesis. Please try a current version of Chrome,
          Edge, Safari or Firefox.
        </Notice>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel title="Text to read">
          <TextArea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste the text you want to hear…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={speak} disabled={!text.trim() || !supported}>
              <Play className="h-4 w-4" /> Play
            </button>
            <button type="button" className="btn-ghost" onClick={pause} disabled={!speaking}>
              <Pause className="h-4 w-4" /> {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn-ghost" onClick={stop} disabled={!speaking}>
              <Square className="h-4 w-4" /> Stop
            </button>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Voice settings">
            <div className="space-y-4">
              <Labeled label="Voice">
                <Select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} disabled={!voices.length}>
                  {voices.length === 0 && <option>Loading voices…</option>}
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </Select>
              </Labeled>
              <Slider label="Speed" min={0.5} max={2} step={0.1} value={rate} onChange={setRate} format={(v) => `${v.toFixed(1)}×`} />
              <Slider label="Pitch" min={0} max={2} step={0.1} value={pitch} onChange={setPitch} format={(v) => v.toFixed(1)} />
              <Slider label="Volume" min={0} max={1} step={0.1} value={volume} onChange={setVolume} format={(v) => `${Math.round(v * 100)}%`} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Words" value={words} />
              <Stat label="Est. length" value={estimate < 1 ? `${Math.round(estimate * 60)}s` : `${estimate.toFixed(1)}m`} />
            </div>
          </Panel>
        </div>
      </div>
    </ToolShell>
  )
}
