import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import { useSeo, SITE } from '@/lib/seo'
import { Labeled, Notice, Panel, TextArea, TextInput } from '@/components/ui/Primitives'

const FAQS = [
  {
    q: 'How quickly will I get a reply?',
    a: 'We are a small team and read every message. Most enquiries get a reply within a few working days.',
  },
  {
    q: 'A tool is not working for me. What should I include?',
    a: 'Tell us which tool, which browser and device you are using, and what you expected to happen. A screenshot helps a great deal.',
  },
  {
    q: 'Can I request a new tool?',
    a: 'Yes, and we welcome it. Describe what you need the tool to do and how you would use it, and we will consider it for a future update.',
  },
  {
    q: 'Do you offer advertising or sponsorship?',
    a: 'For business and advertising enquiries, write to hello@wvbtools.com with a short description of your proposal.',
  },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useSeo({
    title: `Contact Us | ${SITE.name}`,
    description:
      'Get in touch with the WVB Tools team for support, feedback, bug reports or business enquiries.',
    path: '/contact',
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // No backend is bundled: open the user's mail client with a prefilled message.
    const subject = encodeURIComponent(`WVB Tools enquiry from ${name || 'a visitor'}`)
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`)
    window.location.href = `mailto:hello@wvbtools.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-mute">
          Questions, bug reports or ideas for a new tool? Send us a message and we will get back to
          you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Mail, title: 'General', value: 'hello@wvbtools.com' },
            { icon: ShieldCheck, title: 'Privacy', value: 'privacy@wvbtools.com' },
            { icon: MessageSquare, title: 'Legal', value: 'legal@wvbtools.com' },
          ].map((c) => (
            <div key={c.title} className="card p-4">
              <c.icon className="h-5 w-5 text-brand-600" />
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-mute">
                {c.title}
              </div>
              <div className="mt-0.5 break-all text-sm font-semibold text-ink">{c.value}</div>
            </div>
          ))}
        </div>

        <Panel title="Send a message" className="mt-8">
          {sent && (
            <Notice tone="success" className="mb-4">
              Your email app should have opened with your message ready to send. If it did not,
              email us directly at hello@wvbtools.com.
            </Notice>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Your name" htmlFor="c-name">
                <TextInput
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </Labeled>
              <Labeled label="Your email" htmlFor="c-email">
                <TextInput
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </Labeled>
            </div>
            <Labeled label="Message" htmlFor="c-message">
              <TextArea
                id="c-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                required
              />
            </Labeled>
            <button type="submit" className="btn-primary">
              Send message
            </button>
          </form>
        </Panel>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink">Frequently asked questions</h2>
          <dl className="mt-4 space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-xl border border-surface-line bg-surface-muted/40 p-4">
                <dt className="font-display text-[15px] font-bold text-ink">{item.q}</dt>
                <dd className="mt-1.5 text-[14px] leading-6 text-ink-soft">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-8 text-[13px] leading-6 text-ink-mute">
          We read every message, but we are a small team, so please allow a few days for a reply. For
          details on how we handle the information you send us, see our{' '}
          <Link to="/privacy-policy" className="font-semibold text-brand-700 underline">
            Privacy Policy
          </Link>
          .
        </p>

      </div>
    </div>
  )
}
