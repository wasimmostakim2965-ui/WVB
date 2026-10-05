import { LegalPage } from '@/components/layout/LegalPage'

export default function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      description="Important limitations and disclaimers for the tools and information provided by WVB Tools."
      path="/disclaimer"
      updated="October 5, 2026"
    >
      <p>
        The information and tools on <strong>wvbtools.com</strong> are provided for general
        informational and utility purposes only. Please read this disclaimer carefully before
        relying on any result.
      </p>

      <h2>1. Accuracy of results</h2>
      <p>
        Our tools are designed to be accurate, but results are produced by automated calculations
        and browser APIs and may contain errors or limitations. Always verify important results
        independently before acting on them.
      </p>

      <h2>2. No professional advice</h2>
      <p>
        Some tools relate to areas such as finance, health and security. Nothing on this Site
        constitutes financial, medical, legal or professional advice. In particular:
      </p>
      <ul>
        <li>
          <strong>Loan and interest calculations</strong> are estimates for planning only and do not
          represent an offer of credit. Actual terms depend on your lender.
        </li>
        <li>
          <strong>BMI, calorie and ideal-weight results</strong> are general estimates and are not
          medical advice. Consult a qualified healthcare professional about your health.
        </li>
        <li>
          <strong>Password strength and security tools</strong> give guidance only and cannot
          guarantee security. Passwords are generated and checked on your device.
        </li>
      </ul>

      <h2>3. Use at your own risk</h2>
      <p>
        You use the tools at your own risk. We are not liable for any loss or damage, including
        loss of data, arising from the use of, or inability to use, the Site or its tools. Always
        keep your own backups of important files.
      </p>

      <h2>4. External links and services</h2>
      <p>
        The Site may link to or rely on third-party websites and services. We do not control and are
        not responsible for their content, accuracy or availability.
      </p>

      <h2>5. No affiliation</h2>
      <p>
        WVB Tools is an independent website. Product names such as YouTube, Google, Windows and
        others are trademarks of their respective owners and are used only to describe
        compatibility. We are not affiliated with, endorsed by or sponsored by them.
      </p>

      <h2>6. Contact</h2>
      <p>
        If you have questions about this disclaimer, email <strong>legal@wvbtools.com</strong>.
      </p>
    </LegalPage>
  )
}
