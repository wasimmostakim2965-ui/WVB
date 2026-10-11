import { LegalPage } from '@/components/layout/LegalPage'

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="What cookies and local storage WVB Tools uses, why we use them, and how to control them."
      path="/cookie-policy"
      updated="October 11, 2026"
    >
      <p>
        This Cookie Policy explains how <strong>WVB Tools</strong> uses cookies and similar
        technologies such as local storage on <strong>xonomo.site</strong>. It should be read
        together with our <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files placed on your device by a website. They are widely used to
        make sites work, remember preferences and measure usage. Local storage is a similar
        browser feature that stores data until you clear it.
      </p>

      <h2>2. Cookies we use</h2>
      <h3>Essential</h3>
      <p>
        WVB Tools does not set its own cookies and does not store personal data in your browser's
        local storage. The tools run in your browser, and the files and text you use with them stay
        on your device.
      </p>
      <h3>Advertising</h3>
      <p>
        When advertising is enabled, third-party advertising partners including Google may use
        cookies to display relevant ads and measure their performance. Google's advertising cookies
        may be used to serve ads based on your visits to this and other sites. These cookies are set
        by those third parties, not by us.
      </p>
      <h3>Analytics</h3>
      <p>
        We use <strong>Google Analytics 4</strong>, which sets cookies such as <code>_ga</code> and
        <code>_ga_*</code> to measure visits and tool usage. The data is pseudonymous, is not linked
        to you as a person and is not sold. You can block these cookies in your browser settings.
      </p>

      <h2>3. Managing cookies</h2>
      <p>
        You can control cookies in several ways:
      </p>
      <ul>
        <li>Clear cookies and site data for this Site in your browser settings at any time.</li>
        <li>
          Opt out of personalised advertising through{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </li>
        <li>Set your browser to block third-party cookies.</li>
      </ul>
      <p>
        Blocking third-party cookies does not affect the tools themselves, which run without them.
      </p>

      <h2>4. Changes</h2>
      <p>
        We may update this Cookie Policy as our practices change. The "Last updated" date shows the
        most recent revision.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions about cookies? Email <strong>wasimmostakim2965@gmail.com</strong>.
      </p>
    </LegalPage>
  )
}
