import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Pause, Play, Square } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, Select, Slider, Stat, TextArea } from '@/components/ui/Primitives'
import { downloadBlob } from '@/lib/files'
import { formatBytes } from '@/lib/format'

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
  const [recording, setRecording] = useState(false)
  const [audio, setAudio] = useState<{ blob: Blob; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

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
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
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
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
  }

  const recordAudio = async () => {
    setError(null)
    if (!text.trim()) return
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError(
        'Your browser cannot record system audio directly. Use the Play button to listen, or record with the Screen Recorder tool while this plays.',
      )
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop())
        setError(
          'No audio track was shared. When the browser asks what to share, choose a tab and tick "Share tab audio".',
        )
        return
      }
      const recorder = new MediaRecorder(new MediaStream(audioTracks))
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudio((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return { blob, url: URL.createObjectURL(blob) }
        })
        setRecording(false)
        stream.getTracks().forEach((t) => t.stop())
      }
      mediaRecorderRef.current = recorder
      recorder.start(500)
      setRecording(true)
      speak()
    } catch (e) {
      setError((e as Error).message || 'Recording was cancelled.')
      setRecording(false)
    }
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="text-to-speech"
      content={
        <>
          <h2>Turn text into speech</h2>
          <p>
            Type or paste your text, choose a voice, and press play to hear it read aloud. Adjust the
            speed and pitch to suit your content, whether it is an article, a script or a study note.
          </p>
          <h2>Voices and languages</h2>
          <p>
            The voices available come from your own browser and operating system, so the list varies
            by device. On most computers you will find several English voices plus others for
            different languages, and you can install more in your system settings.
          </p>
          <h2>Downloading the audio</h2>
          <p>
            Because the speech is produced by your system rather than a server, downloading it
            requires capturing the sound as it plays. Press <strong>Record audio</strong>, choose the
            current tab and tick "share tab audio" when your browser asks. The recording appears
            below to download once the speech finishes.
          </p>
          <h2>Good to know</h2>
          <ul>
            <li>Nothing is sent to a server; the speech is generated on your device.</li>
            <li>Long texts take longer to speak; the estimate above shows the expected duration.</li>
            <li>If a voice sounds robotic, try a different one — quality varies a lot between voices.</li>
          </ul>
        </>
      }
      faqs={[
        {
          q: 'Can I download the audio as an MP3?',
          a: 'The download is saved as WEBM audio, which plays in most browsers and players. You can convert it to MP3 afterwards if you need that format.',
        },
        {
          q: 'Why do the available voices differ on my phone?',
          a: 'Voices come from your operating system. Different devices and browsers include different sets, and you can usually add more in your system settings.',
        },
        {
          q: 'Is my text sent to a server?',
          a: 'No. The speech is generated locally by your browser using the built-in speech synthesis engine.',
        },
      ]}
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
            <button type="button" className="btn-primary" onClick={speak} disabled={!text.trim() || !supported || recording}>
              <Play className="h-4 w-4" /> Play
            </button>
            <button type="button" className="btn-ghost" onClick={pause} disabled={!speaking}>
              <Pause className="h-4 w-4" /> {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn-ghost" onClick={stop} disabled={!speaking && !recording}>
              <Square className="h-4 w-4" /> Stop
            </button>
            <button type="button" className="btn-soft" onClick={recordAudio} disabled={!text.trim() || recording}>
              {recording ? 'Recording…' : 'Record audio'}
            </button>
          </div>
          {error && <Notice tone="warn" className="mt-4">{error}</Notice>}
          {recording && (
            <Notice tone="info" className="mt-4">
              Recording in progress. The speech is playing now — it will stop and save automatically
              when finished.
            </Notice>
          )}
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

          {audio && (
            <Panel title="Recorded audio">
              <audio src={audio.url} controls className="w-full" />
              <div className="mt-2 text-xs text-ink-mute">{formatBytes(audio.blob.size)}</div>
              <button
                type="button"
                className="btn-primary mt-3 w-full"
                onClick={() => downloadBlob(audio.blob, `speech-${Date.now()}.webm`)}
              >
                <Download className="h-4 w-4" /> Download audio
              </button>
            </Panel>
          )}
        </div>
      </div>
    </ToolShell>
  )
}
