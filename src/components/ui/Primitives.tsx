import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { copyText } from '@/lib/files'

export function Panel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <section className={cn('card p-5 sm:p-6', className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-mute">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Labeled({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {hint && <span className="ml-1.5 font-normal text-ink-mute">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('field', props.className)} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('field resize-y', props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('field cursor-pointer pr-9', props.className)} />
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[13px] font-semibold text-ink-soft" htmlFor={id}>
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-brand-700">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-line accent-brand-600"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <button
      type="button"
      className={cn('btn-soft', className)}
      disabled={!value}
      onClick={async () => {
        const ok = await copyText(value)
        if (!ok) return
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'default' | 'brand' | 'good' | 'warn' | 'bad'
}) {
  const tones = {
    default: 'text-ink',
    brand: 'text-brand-700',
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-red-600',
  }
  return (
    <div className="rounded-xl border border-surface-line bg-surface-muted/50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className={cn('mt-1 font-display text-xl font-bold', tones[tone])}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-mute">{sub}</div>}
    </div>
  )
}

export function Notice({
  children,
  tone = 'info',
  className,
}: {
  children: ReactNode
  tone?: 'info' | 'warn' | 'error' | 'success'
  className?: string
}) {
  const tones = {
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }
  return (
    <div className={cn('rounded-xl border px-3.5 py-2.5 text-sm', tones[tone], className)}>
      {children}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-mute">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </span>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex flex-wrap gap-1 rounded-xl border border-surface-line bg-surface-muted p-1', className)}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-[13px] font-semibold transition',
            value === opt.value
              ? 'bg-white text-brand-700 shadow-card'
              : 'text-ink-mute hover:text-ink-soft',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const ErrorBoundaryCtx = createContext<(message: string | null) => void>(() => {})
export const useToolError = () => useContext(ErrorBoundaryCtx)

export function ToolErrorProvider({
  value,
  children,
}: {
  value: (message: string | null) => void
  children: ReactNode
}) {
  return <ErrorBoundaryCtx.Provider value={value}>{children}</ErrorBoundaryCtx.Provider>
}
