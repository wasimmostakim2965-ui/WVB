# AdSense approval roadmap

This document maps each **official Google requirement** to how WVB Tools satisfies
it, and lists the one manual step that only the account owner can do.

## Official sources

- Eligibility requirements — https://support.google.com/adsense/answer/9724
- Make sure your site's pages are ready — https://support.google.com/adsense/answer/7299563
- AdSense Program policies — https://support.google.com/adsense/answer/48182
- Why your account wasn't approved (insufficient content, quality) — https://support.google.com/adsense/answer/81904
- Consent management for EEA/UK/Switzerland — https://support.google.com/adsense/answer/13554116

## Requirement → status

| Official requirement | How it is met here | Status |
| --- | --- | --- |
| You must be able to access the HTML source of the site | Every route is prerendered to a real HTML file with its own title, description, canonical and JSON-LD in the static source (`scripts/prerender.mjs`) | Done |
| Unique, original, high-quality content | 19 tool pages each carry 500–600 words of original long-form content plus a FAQ (`src/data/toolContent.ts`) | Done |
| Sufficient text; not mostly images/video | Each tool page renders full sentences and paragraphs, not just a widget | Done |
| No "under construction" / template-only pages | All 26 routes are live, built and content-complete | Done |
| Complete sentences and paragraphs | Long-form sections and FAQs on every tool page | Done |
| Clear, easy-to-use navigation | Header mega-nav, tool directory with search/filter, breadcrumbs, footer sitemap | Done |
| Ads not on thin or legal pages | Ad slots exist only on the directory page and inside tools. Privacy, Terms, Cookie, Disclaimer, About and Contact carry no ads | Done |
| Place ad code on a live page | Set `VITE_ADSENSE_CLIENT` and the build writes the verification meta tag, the AdSense script and a valid `ads.txt` into every page | Config step |
| No invalid clicks / self-clicks | No incentives and no automated clicking anywhere in the code | Done |
| No misleading navigation or fake downloads | Navigation and tool labels describe exactly what each tool does | Done |
| Accessible privacy disclosure | `/privacy-policy`, `/cookie-policy`, `/terms`, `/disclaimer` all present and linked in the footer | Done |
| EEA/UK/CH consent | Turn on a Google-certified CMP (see note below) when advertising is enabled | Config step |

## The manual steps (account owner)

1. The account's publisher id (`ca-pub-1266781820950132`) is already wired in: the
   verification `<script>` sits in the `<head>` of `index.html`, so every prerendered
   page carries it, and `ads.txt` contains the matching seller line.
2. To use a different publisher id, set `VITE_ADSENSE_CLIENT` in Vercel; the build
   overrides both the meta tag and `ads.txt` with it.
3. Create your ad units in AdSense and set `VITE_ADSENSE_SLOT_TOOLS` and
   `VITE_ADSENSE_SLOT_SIDEBAR`. Until a slot id is set, that `AdSlot` renders nothing,
   so the layout stays clean and no ad request is made.

## Notes

- AdSense typically wants a site to be live for some weeks with regular content
  before approving. Keep adding to the tool pages and the set will grow.
- For visitors in the EEA, the UK and Switzerland, Google requires a certified
  consent management platform (CMP) once ads are enabled. Turn one on in
  AdSense → Privacy & messaging; the privacy and cookie pages already describe it.
- After approval, review the Ad Experience Report in Search Console to stay clear
  of the Better Ads Standards.
