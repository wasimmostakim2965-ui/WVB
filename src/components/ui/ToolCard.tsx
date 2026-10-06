import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { cn } from '@/lib/cn'

const TINT_CLASSES = [
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-rose-600',
  'from-sky-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-green-500 to-teal-600',
  'from-pink-500 to-rose-600',
]

/** Stable per-slug tint so a tool keeps the same colour everywhere it appears. */
export function tintIndex(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h % TINT_CLASSES.length
}

export function ToolCard({
  tool,
  className,
  showArrow = true,
}: {
  tool: ToolMeta
  className?: string
  showArrow?: boolean
}) {
  const Icon = tool.icon
  return (
    <Link
      to={`/${tool.slug}`}
      className={cn(
        'card tool-tile group relative flex flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90',
          TINT_CLASSES[tintIndex(tool.slug)],
        )}
      />
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm',
              TINT_CLASSES[tintIndex(tool.slug)],
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          {showArrow && (
            <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-mute opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          )}
        </div>
        <h3 className="mt-3.5 font-display text-[15px] font-bold leading-snug text-ink group-hover:text-brand-700">
          {tool.name}
        </h3>
        <p className="mt-1.5 text-[13px] leading-6 text-ink-mute">{tool.short}</p>
        <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-ink-mute/80">
          {tool.category}
        </span>
      </div>
    </Link>
  )
}
