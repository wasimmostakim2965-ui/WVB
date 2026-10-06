import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { cn } from '@/lib/cn'

/**
 * The one card used everywhere a tool is listed: a bold gradient thumbnail with
 * the tool icon and name, the plain-language summary, and its category. The
 * gradient is derived from the slug so every tool keeps a stable colour.
 */
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
        'card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift',
        className,
      )}
    >
      <div className={cn('tool-tile relative grid h-32 place-items-center overflow-hidden', `tint-${tintIndex(tool.slug)}`)}>
        <span aria-hidden className="tool-tile-glow" />
        <Icon className="relative h-12 w-12 text-white drop-shadow" strokeWidth={1.8} />
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
          {tool.category.split(' ')[0]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold leading-snug text-ink group-hover:text-brand-700">
            {tool.name}
          </h3>
          {showArrow && (
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          )}
        </div>
        <p className="text-[13px] leading-6 text-ink-mute">{tool.short}</p>
      </div>
    </Link>
  )
}

const TINTS = 8
export function tintIndex(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h % TINTS
}
