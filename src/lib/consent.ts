import { useEffect, useState } from 'react'

const KEY = 'wvb-consent-v1'
const EVENT = 'wvb-consent-change'

export type Consent = 'accepted' | 'essential' | null

export function getConsent(): Consent {
  try {
    return localStorage.getItem(KEY) as Consent
  } catch {
    return null
  }
}

export function setConsent(value: Exclude<Consent, null>) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Clears the saved choice so the cookie banner is shown again. */
export function clearConsent() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Reads the visitor's cookie choice and re-renders when it changes. */
export function useConsent(): Consent {
  const [consent, setLocal] = useState<Consent>(() => getConsent())
  useEffect(() => {
    const onChange = () => setLocal(getConsent())
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])
  return consent
}
