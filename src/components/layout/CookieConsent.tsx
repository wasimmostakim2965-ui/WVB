import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { getConsent, setConsent, type Consent } from '@/lib/consent'

export function CookieConsent() {
  const [consent, setLocal] = useState<Consent>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocal(getConsent())
    setReady(true)
  }, [])

  const decide = (value: Exclude<Consent, null>) => {
    setConsent(value)
    setLocal(value)
  }

  if (!ready || consent) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 animate-fade-up p-3 sm:p-4"
    >
      <div className="shell">
        <div className="card flex flex-col gap-4 p-4 shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-3">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm leading-6 text-ink-soft">
              We use essential cookies to run this site and, with your consent, advertising cookies
              to keep the tools free. Read our{' '}
              <Link to="/cookie-policy" className="font-semibold text-brand-700 underline">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="font-semibold text-brand-700 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" className="btn-ghost" onClick={() => decide('essential')}>
              Essential only
            </button>
            <button type="button" className="btn-primary" onClick={() => decide('accepted')}>
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
