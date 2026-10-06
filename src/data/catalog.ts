/**
 * Pure tool catalogue: slugs, copy, categories and keyword targets. It deliberately
 * imports nothing from React so build-time tooling (sitemap and per-route meta
 * generation) can read the exact same data the app renders.
 */

export type Category =
  | 'Image & Media'
  | 'PDF & Documents'
  | 'Developer Tools'
  | 'Design & Color'
  | 'Network & Security'
  | 'Text & Audio'
  | 'Calculators'
  | 'Time & Utilities'

export type ToolIconName =
  | 'fileText'
  | 'image'
  | 'crop'
  | 'scissors'
  | 'qrCode'
  | 'braces'
  | 'palette'
  | 'youtube'
  | 'globe'
  | 'gauge'
  | 'keyRound'
  | 'wifi'
  | 'type'
  | 'volume2'
  | 'landmark'
  | 'heartPulse'
  | 'cake'
  | 'arrowLeftRight'
  | 'timer'

export interface ToolRecord {
  slug: string
  name: string
  /** One-line summary used on cards and as the meta description. */
  short: string
  /** Longer description used in listings and structured data. */
  description: string
  category: Category
  iconName: ToolIconName
  keywords: string[]
  /** Shown first, in the "Popular tools" row. */
  popular?: boolean
}

export const CATEGORIES: Category[] = [
  'Image & Media',
  'PDF & Documents',
  'Developer Tools',
  'Design & Color',
  'Network & Security',
  'Text & Audio',
  'Calculators',
  'Time & Utilities',
]

/**
 * Order matters: this array drives the homepage grid and the header menu, so the
 * most requested tools are listed first.
 */
export const TOOLS: ToolRecord[] = [
  {
    slug: 'pdf-tools',
    name: 'PDF Merge, Split & Compress',
    short: 'Merge, split, compress and convert PDF files.',
    description:
      'Merge several PDF files into one, split a PDF into separate pages, compress a PDF to reduce its size, and convert PDF pages to text or images. All processing is local to your browser.',
    category: 'PDF & Documents',
    iconName: 'fileText',
    keywords: ['pdf merge', 'split pdf', 'compress pdf', 'pdf to text', 'combine pdf online'],
    popular: true,
  },
  {
    slug: 'image-converter',
    name: 'Universal Image Converter',
    short: 'Convert between JPG, PNG, WEBP, GIF, SVG, BMP and AVIF.',
    description:
      'Convert any image between JPG, PNG, WEBP, GIF, SVG, BMP and AVIF formats instantly. Drag and drop one or many files, choose a target format and quality, then download. Everything happens in your browser.',
    category: 'Image & Media',
    iconName: 'image',
    keywords: ['image converter', 'png to jpg', 'webp converter', 'avif converter', 'convert image online'],
    popular: true,
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer & Compressor',
    short: 'Resize, crop and compress images to a smaller file size.',
    description:
      'Resize images to exact pixel dimensions, crop them visually and compress them to a target file size. Keep the aspect ratio or set a custom width and height, then export as JPG, PNG or WEBP.',
    category: 'Image & Media',
    iconName: 'crop',
    keywords: ['image resizer', 'compress image', 'crop image online', 'reduce image size', 'resize photo'],
    popular: true,
  },
  {
    slug: 'background-remover',
    name: 'AI Background Remover',
    short: 'Remove image backgrounds to a transparent PNG in one click.',
    description:
      'Remove the background from any photo in one click using an AI model that runs entirely on your device. The result is a clean transparent PNG ready to download, with no upload and no sign-up.',
    category: 'Image & Media',
    iconName: 'scissors',
    keywords: ['background remover', 'remove bg', 'transparent png', 'remove background from image'],
    popular: true,
  },
  {
    slug: 'qr-code',
    name: 'QR Code Generator & Scanner',
    short: 'Create custom QR codes and scan them from a camera.',
    description:
      'Create QR codes for links, text, email, phone numbers, SMS and WiFi with custom colors, size and a center logo. Scan QR codes from your camera or from an uploaded image.',
    category: 'Time & Utilities',
    iconName: 'qrCode',
    keywords: ['qr code generator', 'qr code scanner', 'custom qr code', 'scan qr from image'],
    popular: true,
  },
  {
    slug: 'code-formatter',
    name: 'Code Formatter & Minifier',
    short: 'Format, beautify and minify HTML, CSS, JS and JSON.',
    description:
      'Clean up and beautify HTML, CSS, JavaScript and JSON, or minify them to reduce file size. Detect errors in JSON, copy the result and download it as a file.',
    category: 'Developer Tools',
    iconName: 'braces',
    keywords: ['code formatter', 'json formatter', 'css beautifier', 'javascript minifier', 'html formatter'],
  },
  {
    slug: 'color-tools',
    name: 'Color Picker & Palette Generator',
    short: 'Pick colors, build palettes and generate CSS gradients.',
    description:
      'Pick colors and read HEX, RGB and HSL values, pull a color straight from an image with the eyedropper, build harmonious palettes and generate copy-ready CSS gradient code.',
    category: 'Design & Color',
    iconName: 'palette',
    keywords: ['color picker', 'hex to rgb', 'color palette generator', 'css gradient generator', 'eyedropper'],
  },
  {
    slug: 'youtube-thumbnail',
    name: 'YouTube Thumbnail Downloader',
    short: 'Grab HD thumbnails from any YouTube video link.',
    description:
      'Paste any YouTube video link to see and download its thumbnail in every available resolution, including HD 1080p, 720p and the standard sizes. Works with youtu.be and shorts links.',
    category: 'Image & Media',
    iconName: 'youtube',
    keywords: ['youtube thumbnail downloader', 'youtube thumbnail grabber', 'hd thumbnail', 'download youtube thumbnail'],
  },
  {
    slug: 'my-ip',
    name: 'My IP Address & Network Inspector',
    short: 'See your public IP, ISP, location and connection details.',
    description:
      'Instantly see your public IPv4 or IPv6 address in large text, along with your internet provider, city and country, an approximate map location, VPN or proxy signals and your browser user agent.',
    category: 'Network & Security',
    iconName: 'globe',
    keywords: ['what is my ip', 'my ip address', 'ip lookup', 'vpn detection', 'network inspector'],
  },
  {
    slug: 'speed-test',
    name: 'Internet Speed Test',
    short: 'Measure ping, download and upload speed in real time.',
    description:
      'Measure your connection with a live speedometer: latency in milliseconds, download speed and upload speed in Mbps. See your connection quality rating and retest at any time.',
    category: 'Network & Security',
    iconName: 'gauge',
    keywords: ['internet speed test', 'check download speed', 'ping test', 'bandwidth test', 'upload speed'],
  },
  {
    slug: 'password-generator',
    name: 'Password Generator & Checker',
    short: 'Create strong passwords and test password strength.',
    description:
      'Generate strong random passwords with control over length, letters, numbers and symbols, and test how long an existing password would take to crack. Nothing is ever sent to a server.',
    category: 'Network & Security',
    iconName: 'keyRound',
    keywords: ['password generator', 'strong password', 'password strength checker', 'random password'],
  },
  {
    slug: 'wifi-qr',
    name: 'WiFi QR Code Generator',
    short: 'Share your WiFi with a scannable QR code.',
    description:
      'Enter a network name and password to create a WiFi QR code that phones can scan to join the network without typing the password. Supports WPA, WEP and open networks, with a printable card.',
    category: 'Network & Security',
    iconName: 'wifi',
    keywords: ['wifi qr code', 'share wifi qr', 'wifi password qr', 'connect wifi by qr code'],
  },
  {
    slug: 'word-counter',
    name: 'Word & Character Counter',
    short: 'Count words, characters, sentences and reading time.',
    description:
      'Count words, characters, sentences, paragraphs and estimated reading time as you type, with keyword density and instant case conversion to upper, lower, title and sentence case.',
    category: 'Text & Audio',
    iconName: 'type',
    keywords: ['word counter', 'character counter', 'reading time', 'case converter', 'keyword density'],
  },
  {
    slug: 'text-to-speech',
    name: 'Text to Speech Generator',
    short: 'Hear any text read aloud with a voice of your choice.',
    description:
      'Turn written text into natural speech using the voices built into your browser. Choose a voice, adjust pitch, speed and volume, then play, pause or stop the reading at any time.',
    category: 'Text & Audio',
    iconName: 'volume2',
    keywords: ['text to speech', 'tts online', 'speech generator', 'voice generator', 'read text aloud'],
  },
  {
    slug: 'loan-calculator',
    name: 'Loan EMI Calculator',
    short: 'Work out monthly EMI, total interest and payments.',
    description:
      'Calculate the monthly instalment (EMI), total interest and total payment for any loan using interactive sliders. See an amortisation breakdown and a visual chart of principal versus interest.',
    category: 'Calculators',
    iconName: 'landmark',
    keywords: ['emi calculator', 'loan calculator', 'mortgage calculator', 'interest calculator', 'amortization'],
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI & Health Calculator',
    short: 'Check BMI, daily calories and ideal weight.',
    description:
      'Calculate your body mass index with a healthy-range gauge, estimate your daily calorie needs from your activity level and find your ideal weight range, in metric or imperial units.',
    category: 'Calculators',
    iconName: 'heartPulse',
    keywords: ['bmi calculator', 'body mass index', 'calorie calculator', 'ideal weight', 'health calculator'],
  },
  {
    slug: 'age-calculator',
    name: 'Age & Birthday Calculator',
    short: 'Find your exact age and count down to your birthday.',
    description:
      'Find your exact age in years, months, days, hours and minutes, count down live to your next birthday, and measure the difference between any two dates.',
    category: 'Calculators',
    iconName: 'cake',
    keywords: ['age calculator', 'birthday countdown', 'date difference', 'how old am i', 'age in days'],
  },
  {
    slug: 'unit-converter',
    name: 'Unit, Currency & Data Converter',
    short: 'Convert units, file sizes and live currency rates.',
    description:
      'Convert length, weight, temperature, area, speed and digital storage units, and convert between currencies using live exchange rates, all in one clean converter.',
    category: 'Calculators',
    iconName: 'arrowLeftRight',
    keywords: ['unit converter', 'currency converter', 'kb to mb', 'celsius to fahrenheit', 'metric converter'],
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch, Timer & World Clock',
    short: 'Time laps, run a countdown and see world clocks.',
    description:
      'Run a precise stopwatch with lap times, set a countdown timer that alerts you when it ends, and view the current time across major world cities at a glance.',
    category: 'Time & Utilities',
    iconName: 'timer',
    keywords: ['online stopwatch', 'countdown timer', 'lap timer', 'world clock', 'timer online'],
  },
]

export const TOOL_BY_SLUG: Record<string, ToolRecord> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t]),
)

export const POPULAR_TOOLS: ToolRecord[] = TOOLS.filter((t) => t.popular)

export function toolsByCategory(): { category: Category; tools: ToolRecord[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((group) => group.tools.length > 0)
}
