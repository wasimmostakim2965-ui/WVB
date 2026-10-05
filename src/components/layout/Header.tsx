import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, Sparkles } from 'lucide-react'
import { CATEGORIES, TOOLS } from '@/data/tools'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/tools', label: 'All Tools' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line/80 bg-white/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="WVB Tools home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white shadow-card">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            WVB<span className="text-brand-600">Tools</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
                menu ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700',
              )}
            >
              Tools
              <ChevronDown className={cn('h-4 w-4 transition', menu && 'rotate-180')} />
            </button>
            {menu && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[640px] animate-fade-in rounded-2xl border border-surface-line bg-white p-3 shadow-lift">
                <div className="grid grid-cols-3 gap-1">
                  {CATEGORIES.map((cat) => (
                    <div key={cat} className="p-1">
                      <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                        {cat}
                      </div>
                      {TOOLS.filter((t) => t.category === cat).map((t) => (
                        <Link
                          key={t.slug}
                          to={`/${t.slug}`}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
                        >
                          <t.icon className="h-3.5 w-3.5 shrink-0 text-ink-mute" />
                          <span className="truncate">{t.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/tools" className="hidden btn-primary sm:inline-flex">
            Browse tools
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-surface-line text-ink-soft md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-surface-line bg-white md:hidden">
          <div className="shell max-h-[70vh] space-y-4 overflow-y-auto py-4">
            {CATEGORIES.map((cat) => (
              <div key={cat}>
                <div className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                  {cat}
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {TOOLS.filter((t) => t.category === cat).map((t) => (
                    <Link
                      key={t.slug}
                      to={`/${t.slug}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                    >
                      <t.icon className="h-4 w-4 text-ink-mute" />
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/about" className="btn-ghost flex-1">
                About
              </Link>
              <Link to="/contact" className="btn-ghost flex-1">
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
