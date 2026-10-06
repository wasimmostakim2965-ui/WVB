import { useSeo, SITE } from '@/lib/seo'
import { AdSlot } from '@/components/ui/AdSlot'
import { TOOLS } from '@/data/tools'

export default function About() {
  useSeo({
    title: `About Us | ${SITE.name}`,
    description:
      'WVB Tools is a free collection of 19 browser-based utilities built for speed and privacy. Learn who we are and how the tools work.',
    path: '/about',
  })
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          About WVB Tools
        </h1>
        <div className="prose-wvb mt-6">
          <p>
            WVB Tools is a free suite of {TOOLS.length} everyday utilities that run entirely in your
            web browser. We built it because the simplest tasks — converting a photo, merging two
            PDFs, checking your IP address, counting words — are often buried behind sign-up walls,
            upload limits and cluttered pages.
          </p>
          <p>
            Our approach is simple: open a tool, do the job, close the tab. No account, no email
            address, no waiting in a queue.
          </p>

          <h2>Privacy by design</h2>
          <p>
            Wherever the technology allows, we process your files <strong>on your own device</strong>{' '}
            using the browser itself. Your images and documents are not uploaded to us, which means
            they stay private and the tools stay fast even on a slow connection.
          </p>

          <h2>What we offer</h2>
          <p>The suite covers eight areas:</p>
          <ul>
            <li>
              <strong>Image &amp; media</strong> — conversion, resizing, background removal, colour
              tools and thumbnails.
            </li>
            <li>
              <strong>PDF &amp; documents</strong> — merging, splitting, compressing and reading PDFs.
            </li>
            <li>
              <strong>Developer tools</strong> — formatting and minifying JSON, JavaScript, CSS and HTML.
            </li>
            <li>
              <strong>Design &amp; color</strong> — colour picking, palettes and CSS gradients.
            </li>
            <li>
              <strong>Network &amp; security</strong> — IP inspection, speed testing, password
              generation and WiFi QR codes.
            </li>
            <li>
              <strong>Text &amp; audio</strong> — counting, case conversion and text-to-speech.
            </li>
            <li>
              <strong>Calculators</strong> — loans, health, age and unit conversion.
            </li>
            <li>
              <strong>Time &amp; utilities</strong> — QR codes, stopwatch, timer and world clock.
            </li>
          </ul>

          <h2>How the site is funded</h2>
          <p>
            WVB Tools is free to use and is supported by advertising. Ads are what allow us to keep
            every tool open to everyone without a subscription. We keep ad placements clearly
            separated from the tools so they never get in the way of your work.
          </p>

          <h2>Feedback</h2>
          <p>
            Found a bug or have an idea for a tool we should add? We would like to hear from you —
            visit our <a href="/contact">contact page</a>.
          </p>
        </div>
        <AdSlot slot="about-bottom" minHeight={250} className="mt-12" />
      </div>
    </div>
  )
}
