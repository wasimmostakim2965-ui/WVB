import { LegalPage } from '@/components/layout/LegalPage'

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="What cookies and local storage WVB Tools uses, why we use them, and how to control them."
      path="/cookie-policy"
      updated="October 5, 2026"
    >
      <p>
        This Cookie Policy explains how <strong>WVB Tools</strong> uses cookies and similar
        technologies such as local storage on <strong>wvbtools.com</strong>. It should be read
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
        We store your cookie consent choice in your browser's local storage (key{' '}
        <code>wvb-consent-v1</code>) so we do not ask you on every visit. This is necessary for the
        Site to respect your choice and cannot be turned off while you use the Site.
      </p>
      <h3>Advertising</h3>
      <p>
        With your consent, third-party advertising partners including Google use cookies to display
        relevant ads and measure their performance. Google's advertising cookies may be used to
        serve ads based on your visits to this and other sites. These cookies are set only after you
        choose "Accept all".
      </p>
      <h3>Analytics</h3>
      <p>
        If analytics are enabled, they help us count visits and understand which tools are used.
        Analytics data is aggregated and does not identify you.
      </p>

      <h2>3. Managing cookies</h2>
      <p>
        You can control cookies in several ways:
      </p>
      <ul>
        <li>
          Use the cookie banner on your first visit to accept or decline advertising cookies.
        </li>
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
        Blocking essential storage may affect how the Site behaves, but the tools themselves will
        still work.
      </p>

      <h2>4. Changes</h2>
      <p>
        We may update this Cookie Policy as our practices change. The "Last updated" date shows the
        most recent revision.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions about cookies? Email <strong>privacy@wvbtools.com</strong>.
      </p>
    </LegalPage>
  )
}
