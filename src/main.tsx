import { StrictMode, useEffect, type ReactNode } from 'react'
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
 * Keeps Google Consent Mode in step with the visitor's cookie choice. The tag in
 * index.html starts every signal as "denied", so no advertising cookie is set
 * until the visitor accepts; here we flip the signals to "granted" and back.
 */
function ConsentModeBridge() {
  useEffect(() => {
    const apply = () => {
      const granted = getConsent() === 'accepted'
      const value = granted ? 'granted' : 'denied'
      const w = window as unknown as { gtag?: (...args: unknown[]) => void }
      if (typeof w.gtag !== 'function') return
      w.gtag('consent', 'update', {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
      })
    }
    apply()
    window.addEventListener('wvb-consent-change', apply)
    return () => window.removeEventListener('wvb-consent-change', apply)
  }, [])
  return null
}

function Root({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ConsentModeBridge />
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
