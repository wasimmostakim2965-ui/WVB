import {
  ArrowLeftRight,
  Braces,
  Cake,
  Crop,
  FileText,
  Gauge,
  Globe,
  HeartPulse,
  Image as ImageIcon,
  KeyRound,
  Landmark,
  Palette,
  QrCode,
  Scissors,
  Timer,
  Type,
  Video,
  Volume2,
  Wifi,
  Youtube,
  type LucideIcon,
} from 'lucide-react'

export type Category =
  | 'Image & Media'
  | 'PDF & Documents'
  | 'Developer Tools'
  | 'Design & Color'
  | 'Network & Security'
  | 'Text & Audio'
  | 'Calculators'
  | 'Time & Utilities'

export interface ToolMeta {
  slug: string
  name: string
  short: string
  description: string
  category: Category
  icon: LucideIcon
  keywords: string[]
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

export const TOOLS: ToolMeta[] = [
  {
    slug: 'image-converter',
    name: 'Universal Image Converter',
    short: 'Convert between JPG, PNG, WEBP, GIF, SVG, BMP and AVIF.',
    description:
      'Convert any image between JPG, PNG, WEBP, GIF, SVG, BMP and AVIF formats instantly. Drag and drop one or many files, choose a target format and quality, then download. Everything happens in your browser.',
    category: 'Image & Media',
    icon: ImageIcon,
    keywords: ['image converter', 'png to jpg', 'webp converter', 'avif converter', 'convert image online'],
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer & Compressor',
    short: 'Resize, crop and compress images to a smaller file size.',
    description:
      'Resize images to exact pixel dimensions, crop them visually and compress them to a target file size. Keep the aspect ratio or set a custom width and height, then export as JPG, PNG or WEBP.',
    category: 'Image & Media',
    icon: Crop,
    keywords: ['image resizer', 'compress image', 'crop image online', 'reduce image size', 'resize photo'],
  },
  {
    slug: 'background-remover',
    name: 'AI Background Remover',
    short: 'Remove image backgrounds to a transparent PNG in one click.',
    description:
      'Remove the background from any photo in one click using an AI model that runs entirely on your device. The result is a clean transparent PNG ready to download, with no upload and no sign-up.',
    category: 'Image & Media',
    icon: Scissors,
    keywords: ['background remover', 'remove bg', 'transparent png', 'remove background from image'],
  },
  {
    slug: 'color-tools',
    name: 'Color Picker & Palette Generator',
    short: 'Pick colors, build palettes and generate CSS gradients.',
    description:
      'Pick colors and read HEX, RGB and HSL values, pull a color straight from an image with the eyedropper, build harmonious palettes and generate copy-ready CSS gradient code.',
    category: 'Design & Color',
    icon: Palette,
    keywords: ['color picker', 'hex to rgb', 'color palette generator', 'css gradient generator', 'eyedropper'],
  },
  {
    slug: 'youtube-thumbnail',
    name: 'YouTube Thumbnail Downloader',
    short: 'Grab HD thumbnails from any YouTube video link.',
    description:
      'Paste any YouTube video link to see and download its thumbnail in every available resolution, including HD 1080p, 720p and the standard sizes. Works with youtu.be and shorts links.',
    category: 'Image & Media',
    icon: Youtube,
    keywords: ['youtube thumbnail downloader', 'youtube thumbnail grabber', 'hd thumbnail', 'download youtube thumbnail'],
  },
  {
    slug: 'screen-recorder',
    name: 'Screen Recorder & Screenshot',
    short: 'Record your screen or capture a screenshot in the browser.',
    description:
      'Record your screen, a window or a browser tab with optional microphone audio, or capture a full-page screenshot, directly in your browser. No plugin, no watermark and nothing leaves your device.',
    category: 'Image & Media',
    icon: Video,
    keywords: ['screen recorder', 'record screen online', 'screenshot tool', 'tab recorder', 'free screen recorder'],
  },
  {
    slug: 'pdf-tools',
    name: 'PDF Merge, Split & Compress',
    short: 'Merge, split, compress and convert PDF files.',
    description:
      'Merge several PDF files into one, split a PDF into separate pages, compress a PDF to reduce its size, and convert PDF pages to text or images. All processing is local to your browser.',
    category: 'PDF & Documents',
    icon: FileText,
    keywords: ['pdf merge', 'split pdf', 'compress pdf', 'pdf to text', 'combine pdf online'],
  },
  {
    slug: 'code-formatter',
    name: 'Code Formatter & Minifier',
    short: 'Format, beautify and minify HTML, CSS, JS and JSON.',
    description:
      'Clean up and beautify HTML, CSS, JavaScript and JSON, or minify them to reduce file size. Detect errors in JSON, copy the result and download it as a file.',
    category: 'Developer Tools',
    icon: Braces,
    keywords: ['code formatter', 'json formatter', 'css beautifier', 'javascript minifier', 'html formatter'],
  },
  {
    slug: 'my-ip',
    name: 'My IP Address & Network Inspector',
    short: 'See your public IP, ISP, location and connection details.',
    description:
      'Instantly see your public IPv4 or IPv6 address in large text, along with your internet provider, city and country, an approximate map location, VPN or proxy signals and your browser user agent.',
    category: 'Network & Security',
    icon: Globe,
    keywords: ['what is my ip', 'my ip address', 'ip lookup', 'vpn detection', 'network inspector'],
  },
  {
    slug: 'speed-test',
    name: 'Internet Speed Test',
    short: 'Measure ping, download and upload speed in real time.',
    description:
      'Measure your connection with a live speedometer: latency in milliseconds, download speed and upload speed in Mbps. See your connection quality rating and retest at any time.',
    category: 'Network & Security',
    icon: Gauge,
    keywords: ['internet speed test', 'check download speed', 'ping test', 'bandwidth test', 'upload speed'],
  },
  {
    slug: 'password-generator',
    name: 'Password Generator & Checker',
    short: 'Create strong passwords and test password strength.',
    description:
      'Generate strong random passwords with control over length, letters, numbers and symbols, and test how long an existing password would take to crack. Nothing is ever sent to a server.',
    category: 'Network & Security',
    icon: KeyRound,
    keywords: ['password generator', 'strong password', 'password strength checker', 'random password'],
  },
  {
    slug: 'wifi-qr',
    name: 'WiFi QR Code Generator',
    short: 'Share your WiFi with a scannable QR code.',
    description:
      'Enter a network name and password to create a WiFi QR code that phones can scan to join the network without typing the password. Supports WPA, WEP and open networks, with a printable card.',
    category: 'Network & Security',
    icon: Wifi,
    keywords: ['wifi qr code', 'share wifi qr', 'wifi password qr', 'connect wifi by qr code'],
  },
  {
    slug: 'word-counter',
    name: 'Word & Character Counter',
    short: 'Count words, characters, sentences and reading time.',
    description:
      'Count words, characters, sentences, paragraphs and estimated reading time as you type, with keyword density and instant case conversion to upper, lower, title and sentence case.',
    category: 'Text & Audio',
    icon: Type,
    keywords: ['word counter', 'character counter', 'reading time', 'case converter', 'keyword density'],
  },
  {
    slug: 'text-to-speech',
    name: 'Text to Speech Generator',
    short: 'Turn text into downloadable audio with any voice.',
    description:
      'Turn written text into natural speech using the voices built into your browser. Choose a voice, adjust pitch and speed, preview instantly and download the result as an audio file.',
    category: 'Text & Audio',
    icon: Volume2,
    keywords: ['text to speech', 'tts online', 'speech generator', 'voice generator', 'read text aloud'],
  },
  {
    slug: 'qr-code',
    name: 'QR Code Generator & Scanner',
    short: 'Create custom QR codes and scan them from a camera.',
    description:
      'Create QR codes for links, text, email, phone numbers, SMS and WiFi with custom colors, size and a center logo. Scan QR codes from your camera or from an uploaded image.',
    category: 'Time & Utilities',
    icon: QrCode,
    keywords: ['qr code generator', 'qr code scanner', 'custom qr code', 'scan qr from image'],
  },
  {
    slug: 'loan-calculator',
    name: 'Loan EMI Calculator',
    short: 'Work out monthly EMI, total interest and payments.',
    description:
      'Calculate the monthly instalment (EMI), total interest and total payment for any loan using interactive sliders. See an amortisation breakdown and a visual chart of principal versus interest.',
    category: 'Calculators',
    icon: Landmark,
    keywords: ['emi calculator', 'loan calculator', 'mortgage calculator', 'interest calculator', 'amortization'],
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI & Health Calculator',
    short: 'Check BMI, daily calories and ideal weight.',
    description:
      'Calculate your body mass index with a healthy-range gauge, estimate your daily calorie needs from your activity level and find your ideal weight range, in metric or imperial units.',
    category: 'Calculators',
    icon: HeartPulse,
    keywords: ['bmi calculator', 'body mass index', 'calorie calculator', 'ideal weight', 'health calculator'],
  },
  {
    slug: 'age-calculator',
    name: 'Age & Birthday Calculator',
    short: 'Find your exact age and count down to your birthday.',
    description:
      'Find your exact age in years, months, days, hours and minutes, count down live to your next birthday, and measure the difference between any two dates.',
    category: 'Calculators',
    icon: Cake,
    keywords: ['age calculator', 'birthday countdown', 'date difference', 'how old am i', 'age in days'],
  },
  {
    slug: 'unit-converter',
    name: 'Unit, Currency & Data Converter',
    short: 'Convert units, file sizes and live currency rates.',
    description:
      'Convert length, weight, temperature, area, speed and digital storage units, and convert between currencies using live exchange rates, all in one clean converter.',
    category: 'Calculators',
    icon: ArrowLeftRight,
    keywords: ['unit converter', 'currency converter', 'kb to mb', 'celsius to fahrenheit', 'metric converter'],
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch, Timer & World Clock',
    short: 'Time laps, run a countdown and see world clocks.',
    description:
      'Run a precise stopwatch with lap times, set a countdown timer that alerts you when it ends, and view the current time across major world cities at a glance.',
    category: 'Time & Utilities',
    icon: Timer,
    keywords: ['online stopwatch', 'countdown timer', 'lap timer', 'world clock', 'timer online'],
  },
]

export const TOOL_BY_SLUG: Record<string, ToolMeta> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t]),
)

export function toolsByCategory(): { category: Category; tools: ToolMeta[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((group) => group.tools.length > 0)
}
