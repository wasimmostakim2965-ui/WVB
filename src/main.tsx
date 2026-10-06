import { StrictMode, useEffect, useState, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import App from './App'
import { getConsent } from '@/lib/consent'
import './styles.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * Loads the AdSense tag only after the visitor consents to advertising cookies,
 * so no advertising cookies are set before consent.
 */
function AdSenseLoader() {
  const [consent, setLocal] = useState(getConsent())

  useEffect(() => {
    const onChange = () => setLocal(getConsent())
    window.addEventListener('wvb-consent-change', onChange)
    return () => window.removeEventListener('wvb-consent-change', onChange)
  }, [])

  useEffect(() => {
    if (consent !== 'accepted') return
    const client = window.__ADSENSE_CLIENT__
    if (!client || client.includes('XXXX')) return
    if (document.getElementById('adsbygoogle-js')) return
    const s = document.createElement('script')
    s.id = 'adsbygoogle-js'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    document.head.appendChild(s)
  }, [consent])

  return null
}

function Root({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdSenseLoader />
      {children}
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root>
      <App />
    </Root>
  </StrictMode>,
)
