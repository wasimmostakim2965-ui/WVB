import { LegalPage } from '@/components/layout/LegalPage'

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How WVB Tools handles your data. Our tools run in your browser and do not upload your files. Learn about cookies, analytics and advertising."
      path="/privacy-policy"
      updated="October 5, 2026"
    >
      <p>
        This Privacy Policy explains how <strong>WVB Tools</strong> ("we", "us", "our") handles
        information when you visit <strong>wvbtools.com</strong> (the "Site") and use our online
        tools. We designed the Site so that you can use almost every tool without giving us any
        personal information at all.
      </p>

      <h2>1. The short version</h2>
      <ul>
        <li>Most tools run entirely in your browser. Files you open are not uploaded to us.</li>
        <li>We do not ask you to create an account and we do not sell your data.</li>
        <li>
          We use a small number of cookies for essential functions, and advertising cookies where
          you consent to them.
        </li>
      </ul>

      <h2>2. Information you provide</h2>
      <p>
        You can use the Site without registering. If you contact us by email we receive the address
        you write from and whatever you choose to include in your message, and we use it only to
        reply to you.
      </p>

      <h2>3. Files and content you process with the tools</h2>
      <p>
        Our image, PDF, document, text and media tools are built to run{' '}
        <strong>locally in your browser</strong>. When you drag an image, a PDF or a document into
        one of these tools, the file is read and processed on your own device and is{' '}
        <strong>not transmitted to our servers</strong>. Closing the tab discards it.
      </p>
      <p>
        A few tools need to contact a third-party service to work. When you use those tools, the
        specific data needed for the request is sent to that service:
      </p>
      <ul>
        <li>
          <strong>My IP Address</strong> sends a request to <strong>ipwho.is</strong>, a public IP lookup service, to read your
          public IP address and its approximate location.
        </li>
        <li>
          <strong>Internet Speed Test</strong> transfers test data to and from <strong>Cloudflare</strong>'s public speed-test endpoint to measure
          your connection speed.
        </li>
        <li>
          <strong>Unit, Currency &amp; Data Converter</strong> requests current exchange rates from <strong>open.er-api.com</strong>, a public rates
          service.
        </li>
        <li>
          <strong>YouTube Thumbnail Downloader</strong> loads the thumbnail image directly from YouTube's image servers (img.youtube.com) for the video link you paste.
        </li>
        <li>
          <strong>AI Background Remover</strong> downloads an AI model the first time you use it.
          The model runs on your device and your image is not uploaded.
        </li>
      </ul>

      <h2>4. Automatically collected information</h2>
      <p>
        Like most websites, our hosting provider may record standard technical information such as
        your IP address, browser type, the pages you visit and the time of your visit. This is used
        for security, to prevent abuse and to understand overall traffic. It is not used to identify
        you personally.
      </p>

      <h2>5. Cookies and similar technologies</h2>
      <p>
        We use cookies and local storage for the following purposes:
      </p>
      <ul>
        <li>
          <strong>Essential:</strong> remembering your cookie choice and basic preferences. The
          Site cannot work correctly without these.
        </li>
        <li>
          <strong>Advertising:</strong> used by our advertising partners, including Google, to
          display and measure ads. These are set only where you consent.
        </li>
      </ul>
      <p>
        You can change or withdraw your consent at any time by clearing this Site's cookies and
        local storage in your browser, then reloading the page. See our{' '}
        <a href="/cookie-policy">Cookie Policy</a> for full details.
      </p>

      <h2>6. Advertising and Google AdSense</h2>
      <p>
        The Site is supported by advertising, which keeps every tool free. We use third-party
        advertising companies, including <strong>Google AdSense</strong>, to serve ads.
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits
          to this website or other websites.
        </li>
        <li>
          Google's use of advertising cookies enables it and its partners to serve ads to you based
          on your visit to our Site and/or other sites on the Internet.
        </li>
        <li>
          You may opt out of personalised advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          , or opt out of some third-party vendors' use of cookies for personalised advertising at{' '}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </li>
      </ul>
      <p>
        For visitors in the European Economic Area, the United Kingdom and Switzerland, we ask for
        consent before advertising cookies are set, and we work with Google's certified consent
        management requirements. Where required, ads are served on a non-personalised basis.
      </p>

      <h2>7. Analytics</h2>
      <p>
        We may use privacy-respecting analytics to count visits and understand which tools are
        useful. Where analytics are used, the data is aggregated and does not identify you.
      </p>

      <h2>8. Legal basis and your rights</h2>
      <p>
        Where the GDPR or similar laws apply, we process personal data on the basis of your consent
        (for advertising cookies), our legitimate interest in operating and securing the Site, and
        compliance with legal obligations. You may have the right to access, correct, delete or
        restrict processing of your personal data, and to object to processing. To exercise any of
        these rights, contact us at <strong>privacy@wvbtools.com</strong>.
      </p>

      <h2>9. Children's privacy</h2>
      <p>
        The Site is not directed at children under 13, and we do not knowingly collect personal
        information from them. If you believe a child has provided us with personal data, please
        contact us and we will delete it.
      </p>

      <h2>10. Data retention and security</h2>
      <p>
        Because most processing happens on your device, we hold very little data. Contact emails are
        kept only as long as needed to handle your request. We use reasonable technical measures,
        including HTTPS, to protect information in transit.
      </p>

      <h2>11. Third-party links</h2>
      <p>
        The Site may link to other websites. We are not responsible for their content or privacy
        practices, and we encourage you to read their policies.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Last updated" date above shows
        when it last changed. Significant changes will be highlighted on the Site.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about this policy? Email <strong>privacy@wvbtools.com</strong> or use our{' '}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  )
}
