import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useSeo, SITE } from '@/lib/seo'

export default function NotFound() {
  useSeo({
    title: `Page not found | ${SITE.name}`,
    description: 'The page you were looking for could not be found. Browse our free online tools instead.',
    path: '/404',
  })
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-6 font-display text-6xl font-extrabold tracking-tight text-ink">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">This page does not exist</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-mute">
          The link may be broken or the page may have moved. Head back to the homepage or browse the
          full list of tools.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Go home
          </Link>
          <Link to="/tools" className="btn-ghost">
            Browse all tools
          </Link>
        </div>
      </div>
    </div>
  )
}
