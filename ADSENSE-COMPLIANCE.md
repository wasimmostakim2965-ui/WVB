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
| No "under construction" / template-only pages | All 27 routes are live, built and content-complete | Done |
| Complete sentences and paragraphs | Long-form sections and FAQs on every tool page | Done |
| Clear, easy-to-use navigation | Header mega-nav, tool index with search/filter, breadcrumbs, footer sitemap | Done |
| Ads not on thin or legal pages | Ad slots exist only on the home page, the tool index and inside tools. Privacy, Terms, Cookie, Disclaimer, About and Contact carry no ads | Done |
| Place ad code on a live page | `ads.txt` present; AdSense script and `google-adsense-account` meta tag in the static HTML of every page | Done |
| No ads before consent (EEA/UK/CH) | Google Consent Mode defaults every signal to `denied`; ads are requested non-personalised until the visitor accepts | Done |
| No invalid clicks / self-clicks | No incentives and no automated clicking anywhere in the code | Done |
| No misleading navigation or fake downloads | Navigation and tool labels describe exactly what each tool does | Done |
| Accessible privacy disclosure | `/privacy-policy`, `/cookie-policy`, `/terms`, `/disclaimer` all present and linked in the footer | Done |

## The one manual step (account owner)

1. Sign in to AdSense and copy your publisher id, which looks like `ca-pub-1234567890123456`.
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` in **three** places in `index.html` and once in
   `public/ads.txt`.
3. Create three ad units in AdSense and paste their numeric ids into
   `src/lib/ads.ts` (`homeTop`, `toolsTop`, `toolSidebar`).
4. Rebuild and deploy. Until a unit id is set, that slot renders nothing, so the
   layout stays clean and no request is made.

## Notes

- AdSense typically wants a site to be live for some weeks with regular content
  before approving. Keep adding to the tool pages and the set will grow.
- After approval, review the Ad Experience Report in Search Console to stay clear
  of the Better Ads Standards.
