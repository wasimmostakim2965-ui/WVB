import { useEffect, useRef, useState } from 'react'
import { Camera, CircleStop, Download, Play, Square } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Notice, Panel, SegmentedControl } from '@/components/ui/Primitives'
import { formatBytes, formatDuration } from '@/lib/format'
import { downloadBlob } from '@/lib/files'

type Mode = 'record' | 'screenshot'

export default function ScreenRecorder({ tool }: { tool: ToolMeta }) {
  const [mode, setMode] = useState<Mode>('record')
  const [mic, setMic] = useState(true)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [video, setVideo] = useState<{ blob: Blob; url: string; size: number } | null>(null)
  const [shot, setShot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number>()
  const previewRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setSupported(typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getDisplayMedia))
    return () => {
      window.clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (previewRef.current) previewRef.current.srcObject = null
  }

  const start = async () => {
    setError(null)
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      })
      let stream = display
      if (mic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          stream = new MediaStream([...display.getVideoTracks(), ...micStream.getAudioTracks()])
        } catch {
          setError('Microphone permission was declined, so the recording will have no narration.')
        }
      }
      streamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        previewRef.current.muted = true
        await previewRef.current.play().catch(() => {})
      }

      const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(
        (m) => MediaRecorder.isTypeSupported(m),
      )
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setVideo((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return { blob, url: URL.createObjectURL(blob), size: blob.size }
        })
        stopStream()
      }
      display.getVideoTracks()[0].addEventListener('ended', () => recorder.state !== 'inactive' && recorder.stop())

      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
      setElapsed(0)
      const started = Date.now()
      timerRef.current = window.setInterval(() => setElapsed(Date.now() - started), 200)
    } catch (e) {
      setError((e as Error).message || 'Screen capture was cancelled or is not permitted.')
      stopStream()
    }
  }

  const stop = () => {
    window.clearInterval(timerRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
    setRecording(false)
  }

  const captureScreenshot = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const track = stream.getVideoTracks()[0]
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      await new Promise((r) => setTimeout(r, 350))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')!.drawImage(video, 0, 0)
      const url = canvas.toDataURL('image/png')
      setShot(url)
      track.stop()
      stream.getTracks().forEach((t) => t.stop())
    } catch (e) {
      setError((e as Error).message || 'Screen capture was cancelled or is not permitted.')
    }
  }

  const screenshotDownload = () => {
    if (!shot) return
    const a = document.createElement('a')
    a.href = shot
    a.download = `screenshot-${Date.now()}.png`
    a.click()
  }

  return (
    <ToolShell
      tool={tool}
      adSlot="screen-recorder"
      content={
        <>
          <h2>Record your screen in the browser</h2>
          <p>
            Choose <strong>Record</strong>, press start and pick the screen, window or tab you want
            to capture. When you are done, press stop and the recording appears with a download
            button. You can include your microphone to narrate.
          </p>
          <h2>Capture a screenshot</h2>
          <p>
            Switch to <strong>Screenshot</strong> mode to grab a single still frame. This is useful
            for sharing exactly what is on screen without recording a whole video.
          </p>
          <h2>How it works and what to expect</h2>
          <ul>
            <li>Recording uses your browser's built-in capture API, so nothing is uploaded.</li>
            <li>Recordings are saved as WEBM video, which plays in most players and browsers.</li>
            <li>Your browser asks for permission each time, and you can stop sharing at any moment from the browser bar.</li>
            <li>Screen capture works on desktop browsers; some mobile browsers do not support it.</li>
          </ul>
        </>
      }
      faqs={[
        {
          q: 'Is my recording uploaded anywhere?',
          a: 'No. The recording is captured and stored in your browser memory, then saved to your device when you press download.',
        },
        {
          q: 'What format is the video?',
          a: 'WEBM, which is widely supported. If you need MP4 you can convert it afterwards with a video converter.',
        },
        {
          q: 'Why is the screenshot button not working on my phone?',
          a: 'Screen capture is not supported by all mobile browsers. It works best on desktop Chrome, Edge, Firefox and Safari.',
        },
      ]}
    >
      {!supported && (
        <Notice tone="warn" className="mb-5">
          Your browser does not support screen capture. Please try a current desktop browser.
        </Notice>
      )}

      <div className="mb-5">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'record', label: 'Record' },
            { value: 'screenshot', label: 'Screenshot' },
          ]}
        />
      </div>

      {mode === 'record' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Controls">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-line accent-brand-600"
                checked={mic}
                onChange={(e) => setMic(e.target.checked)}
                disabled={recording}
              />
              Include microphone audio
            </label>

            <div className="mt-5 flex items-center gap-3">
              {!recording ? (
                <button type="button" className="btn-primary" onClick={start} disabled={!supported}>
                  <Play className="h-4 w-4" /> Start recording
                </button>
              ) : (
                <button
                  type="button"
                  className="btn inline-flex bg-red-600 text-white hover:bg-red-700"
                  onClick={stop}
                >
                  <CircleStop className="h-4 w-4" /> Stop recording
                </button>
              )}
              {recording && (
                <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-red-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  {formatDuration(elapsed)}
                </span>
              )}
            </div>

            {error && <Notice tone="warn" className="mt-4">{error}</Notice>}

            <video
              ref={previewRef}
              className="mt-4 aspect-video w-full rounded-xl border border-surface-line bg-ink object-contain"
              playsInline
            />
          </Panel>

          <Panel title="Recording">
            {video ? (
              <>
                <video src={video.url} controls className="w-full rounded-xl border border-surface-line" />
                <div className="mt-3 text-xs text-ink-mute">Size: {formatBytes(video.size)}</div>
                <button
                  type="button"
                  className="btn-primary mt-4 w-full"
                  onClick={() => downloadBlob(video.blob, `recording-${Date.now()}.webm`)}
                >
                  <Download className="h-4 w-4" /> Download recording
                </button>
              </>
            ) : (
              <div className="grid h-64 place-items-center rounded-xl border border-dashed border-surface-line text-sm text-ink-mute">
                Your recording will appear here
              </div>
            )}
          </Panel>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Capture">
            <p className="text-sm leading-6 text-ink-mute">
              Press the button, then choose the screen or window to capture. A still image is taken
              immediately.
            </p>
            <button type="button" className="btn-primary mt-4" onClick={captureScreenshot} disabled={!supported}>
              <Camera className="h-4 w-4" /> Capture screenshot
            </button>
            {error && <Notice tone="warn" className="mt-4">{error}</Notice>}
          </Panel>
          <Panel title="Screenshot">
            {shot ? (
              <>
                <img src={shot} alt="Screenshot" className="w-full rounded-xl border border-surface-line" />
                <button type="button" className="btn-primary mt-4 w-full" onClick={screenshotDownload}>
                  <Download className="h-4 w-4" /> Download PNG
                </button>
              </>
            ) : (
              <div className="grid h-64 place-items-center rounded-xl border border-dashed border-surface-line text-sm text-ink-mute">
                <span className="inline-flex items-center gap-2">
                  <Square className="h-4 w-4" /> Your screenshot will appear here
                </span>
              </div>
            )}
          </Panel>
        </div>
      )}
    </ToolShell>
  )
}
