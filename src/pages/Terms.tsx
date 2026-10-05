import { LegalPage } from '@/components/layout/LegalPage'

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms that govern your use of WVB Tools, a free collection of browser-based online utilities."
      path="/terms"
      updated="October 5, 2026"
    >
      <p>
        These Terms of Service ("Terms") govern your access to and use of{' '}
        <strong>wvbtools.com</strong> (the "Site"). By using the Site you agree to these Terms. If
        you do not agree, please do not use the Site.
      </p>

      <h2>1. Use of the Site</h2>
      <p>
        WVB Tools provides free, browser-based utilities. You may use them for personal or
        commercial purposes, subject to these Terms. You agree not to:
      </p>
      <ul>
        <li>Use the Site for any unlawful, harmful or fraudulent purpose.</li>
        <li>
          Attempt to disrupt, overload, reverse-engineer or gain unauthorised access to the Site or
          its infrastructure.
        </li>
        <li>Use automated systems to scrape or copy the Site in a way that degrades service.</li>
        <li>
          Upload or process content that infringes the rights of others, or that you do not have
          the right to use.
        </li>
      </ul>

      <h2>2. No account required</h2>
      <p>
        You do not need to register to use the tools. Because there is no account, there is nothing
        to cancel, but it also means we cannot restore work you lose by closing a page.
      </p>

      <h2>3. Intellectual property</h2>
      <p>
        The Site, including its design, text, graphics and code, is owned by us or our licensors and
        is protected by intellectual property laws. You keep all rights to the files and content you
        process with the tools; we claim no ownership over them.
      </p>

      <h2>4. Third-party services</h2>
      <p>
        Some tools rely on third-party services (for example, IP lookup, speed testing or exchange
        rates). Those services are provided by others under their own terms, and we are not
        responsible for their availability or accuracy.
      </p>

      <h2>5. Advertising</h2>
      <p>
        The Site displays advertising, including through Google AdSense, to keep the tools free. By
        using the Site you acknowledge that ads may be shown. You agree not to click ads in a
        fraudulent or automated manner.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The tools are provided "as is" and "as available", without warranties of any kind, whether
        express or implied, including fitness for a particular purpose and accuracy. You use the
        tools at your own risk and should keep your own copies of important files.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any indirect, incidental,
        special or consequential damages, or for any loss of data, profits or goodwill arising from
        your use of the Site.
      </p>

      <h2>8. Changes to the Site and Terms</h2>
      <p>
        We may add, change or remove tools and features at any time, and we may update these Terms.
        Continued use after a change means you accept the updated Terms.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable at our place of establishment, without
        regard to conflict-of-law rules.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms? Email <strong>legal@wvbtools.com</strong> or use our{' '}
        <a href="/contact">contact page</a>.
      </p>
    </LegalPage>
  )
}
