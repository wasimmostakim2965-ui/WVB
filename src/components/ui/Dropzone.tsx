import { useCallback, useRef, useState, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  title?: string
  subtitle?: string
  icon?: ReactNode
  className?: string
  disabled?: boolean
}

export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  title = 'Drop files here or click to browse',
  subtitle,
  icon,
  className,
  disabled,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handle = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList)
      onFiles(multiple ? files : files.slice(0, 1))
    },
    [onFiles, multiple],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (!disabled) handle(e.dataTransfer.files)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
        over
          ? 'border-brand-400 bg-brand-50'
          : 'border-surface-line bg-surface-muted/40 hover:border-brand-300 hover:bg-brand-50/40',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
        {icon ?? <UploadCloud className="h-5.5 w-5.5" />}
      </span>
      <span className="text-sm font-semibold text-ink">{title}</span>
      {subtitle && <span className="text-xs text-ink-mute">{subtitle}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
