/**
 * AdSense ad-unit ids, read from build-time environment variables so the source
 * never carries placeholder values:
 *
 *   VITE_ADSENSE_SLOT_TOOLS    — unit shown on the tool directory page
 *   VITE_ADSENSE_SLOT_SIDEBAR  — unit shown in the tool sidebar
 *
 * While a value is empty the matching AdSlot renders nothing, so the layout
 * stays clean and no request is made until the units exist.
 */
const env = (import.meta.env ?? {}) as Record<string, string | undefined>

export const AD_UNITS: Record<string, string> = {
  toolsTop: env.VITE_ADSENSE_SLOT_TOOLS ?? '',
  toolSidebar: env.VITE_ADSENSE_SLOT_SIDEBAR ?? '',
}
