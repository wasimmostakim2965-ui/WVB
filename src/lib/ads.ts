/**
 * AdSense configuration in one place.
 *
 * The site ships with no live ads. To turn them on:
 *   1. Set your publisher id in `index.html` (window.__ADSENSE_CLIENT__) and in
 *      `public/ads.txt`.
 *   2. Create ad units in your AdSense account and paste each numeric unit id
 *      into the matching field below.
 *
 * While a field is empty, the corresponding ad slot renders nothing, so the
 * layout stays clean and no request is made.
 */
export const AD_UNITS: Record<string, string> = {
  homeTop: '',
  toolsTop: '',
  toolSidebar: '',
  legalBottom: '',
}
