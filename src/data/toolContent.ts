/**
 * Long-form, per-tool editorial content: an introduction, explanatory sections,
 * a feature list and an FAQ. This is what turns each tool route into a page with
 * real, unique content (not just a widget), which search engines can index on its
 * own and which meets advertising-quality expectations.
 *
 * Keys must match the slugs in `catalog.ts`.
 */

export interface FaqItem {
  q: string
  a: string
}

export interface ToolContent {
  /** Lead paragraph shown under the tool heading. */
  intro: string
  sections: { heading: string; body: string }[]
  features: string[]
  faq: FaqItem[]
}

const UPDATED = 'October 5, 2026'

export const TOOL_CONTENT: Record<string, ToolContent> = {
  'pdf-tools': {
    intro:
      'PDF is the format most documents are shared in, but the files are often awkward to work with: one scan needs to be split, three reports need to be merged, or an attachment is too large to email. This tool handles the common jobs — merging, splitting, compressing and converting — directly in your browser, so your documents are never uploaded to a server.',
    sections: [
      {
        heading: 'How to use the PDF tools',
        body: 'Add one or more PDF files by dragging them onto the drop zone or clicking to browse. Choose the job you need from the tabs: Merge combines several files into one, in the order shown; Split keeps only the pages you list, such as 1-3,5; Compress rebuilds the file at a lower image quality; and Convert extracts the text or renders pages as images. When the job finishes, download the result with a single click.',
      },
      {
        heading: 'Why local processing matters for documents',
        body: 'PDFs frequently contain contracts, invoices, identity documents and medical records. Uploading them to a third-party converter means trusting that service with confidential information, and many free converters keep the file on their servers for a period. Because this tool runs entirely on your device, the file never leaves your computer and there is nothing to delete afterwards.',
      },
      {
        heading: 'Getting the best results',
        body: 'For compression, lower the image quality slider gradually — most documents look fine at 60–70% and shrink dramatically. For splitting, list pages as comma-separated ranges. Merged files keep the page order you see in the list, so drag the rows to reorder before you merge. If a scanned PDF has no selectable text, use the image conversion option instead of text extraction.',
      },
    ],
    features: [
      'Merge any number of PDFs into a single document',
      'Split by page ranges or extract single pages',
      'Compress by reducing embedded image quality',
      'Convert pages to text or to PNG images',
      'Reordered file list with per-file size readout',
      'Nothing is uploaded — processing stays on your device',
    ],
    faq: [
      {
        q: 'Are my PDF files uploaded anywhere?',
        a: 'No. The files are read and rewritten in your browser using a JavaScript PDF library. Nothing is sent to a server, so confidential documents stay on your device.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'There is no fixed limit, but very large PDFs are bounded by your device memory. Files up to a few hundred megabytes usually process smoothly on a modern computer or phone.',
      },
      {
        q: 'Can I merge PDFs that have different page sizes?',
        a: 'Yes. Each page keeps its original dimensions, so a mix of A4 and Letter pages merges without distortion.',
      },
      {
        q: 'Does compressing a PDF reduce the text quality?',
        a: 'No. Compression reduces the resolution of embedded images, which is where most of the size lives. The text stays crisp and selectable.',
      },
    ],
  },

  'image-converter': {
    intro:
      'Different apps and websites expect different image formats, and renaming a file does not actually change it. This converter reads your image and re-encodes it into the format you need — JPG, PNG, WEBP, GIF, BMP or AVIF — with control over quality, and it does the work in your browser rather than on a server.',
    sections: [
      {
        heading: 'How to convert an image',
        body: 'Drop one or more images onto the page, pick a target format, set the quality if the format is lossy, and convert. You can batch a whole folder at once; each file is converted in turn and offered as a download. A preview shows the original beside the result so you can compare size and appearance before saving.',
      },
      {
        heading: 'Choosing the right format',
        body: 'JPG is the smallest choice for photographs but has no transparency. PNG keeps transparency and sharp edges, which suits logos and screenshots, at the cost of a larger file. WEBP and AVIF are modern formats that beat JPG on size while supporting transparency — ideal for the web, though very old software may not open them. GIF is limited to 256 colours but remains the simple choice for short animations. BMP is uncompressed and rarely worth using except for legacy tools.',
      },
      {
        heading: 'Privacy and quality',
        body: 'Because conversion happens on your device, images that you would not want to publish — personal photos, screenshots of private chats, scans of documents — never travel over the network. Quality settings only apply to lossy formats; PNG and BMP are lossless, so the quality slider is hidden for them.',
      },
    ],
    features: [
      'Convert between JPG, PNG, WEBP, GIF, BMP and AVIF',
      'Batch conversion with per-file download',
      'Quality control for lossy formats',
      'Side-by-side preview and size comparison',
      'Works offline once the page has loaded',
      'No upload, no account, no watermark',
    ],
    faq: [
      {
        q: 'Does converting lose quality?',
        a: 'Converting to a lossy format such as JPG or WEBP re-encodes the pixels, so a small amount of detail is discarded. Choosing a high quality setting keeps the difference invisible. Converting to PNG is lossless.',
      },
      {
        q: 'Can I convert a HEIC photo from an iPhone?',
        a: 'Browsers decode the formats they support. If your browser can open the HEIC file, the converter can read it; otherwise convert it once on the phone before uploading.',
      },
      {
        q: 'Will the transparency be kept?',
        a: 'Transparency is preserved when you convert to PNG, WEBP, AVIF or GIF. JPG and BMP have no transparency, so transparent areas become white.',
      },
      {
        q: 'Is there a limit on how many images I can convert?',
        a: 'No fixed limit. Convert as many as you like, one batch at a time, as often as you need.',
      },
    ],
  },

  'image-resizer': {
    intro:
      'Oversized images slow down websites, bounce back from upload forms and fill up storage. This tool resizes images to exact pixel dimensions, crops them to a chosen region and compresses them to a smaller file size — all without uploading the picture anywhere.',
    sections: [
      {
        heading: 'Resize, crop or compress',
        body: 'Enter a target width and height to resize, or leave the aspect ratio locked and change one value. The crop panel lets you drag a frame over the image to keep only the part you want, with the edges set precisely in pixels. The quality slider compresses the output, and the before/after panel shows exactly how many kilobytes you saved.',
      },
      {
        heading: 'Common sizes to aim for',
        body: 'A profile picture is usually 400×400 pixels. A blog header is often 1200×630, the size social networks use for link previews. A full-width hero image on a modern site rarely needs to exceed 1600 pixels wide, since larger images are scaled down anyway and only add weight. Resizing to the size actually displayed is the single biggest speed win for most sites.',
      },
      {
        heading: 'Keeping images sharp',
        body: 'Downscaling almost always looks better than upscaling, so start from the largest version you have. For screenshots and images with text, export as PNG to keep edges crisp; for photographs, JPG or WEBP at 70–80% quality gives a small file with no visible loss. Cropping before resizing avoids wasting pixels on parts of the image you are going to discard.',
      },
    ],
    features: [
      'Resize to exact width and height',
      'Lock or unlock the aspect ratio',
      'Drag-to-crop with pixel-accurate edges',
      'Compress with a live quality slider',
      'See the size saved before you download',
      'Export as JPG, PNG or WEBP',
    ],
    faq: [
      {
        q: 'Will resizing make my image blurry?',
        a: 'Reducing the dimensions keeps an image sharp. Enlarging beyond the original size adds no real detail and can look soft, so always start from the highest-resolution copy you have.',
      },
      {
        q: 'What is the best image size for the web?',
        a: 'Match the size the image is actually displayed at. For most full-width images, 1600 pixels wide is plenty; thumbnails and avatars need only a few hundred pixels.',
      },
      {
        q: 'Are my images uploaded?',
        a: 'No. Resizing, cropping and compression all happen in your browser using the canvas API, so your photos stay on your device.',
      },
      {
        q: 'Can I resize several images at once?',
        a: 'Yes. Add a batch and apply the same settings, then download each result.',
      },
    ],
  },

  'background-remover': {
    intro:
      'Removing a background used to mean careful work in an image editor. This tool does it in one click using an AI model that runs on your own device, producing a clean transparent PNG you can drop onto any colour, slide or product page.',
    sections: [
      {
        heading: 'How it works',
        body: 'When you add an image, a segmentation model identifies the subject — a person, a product, a pet — and separates it from everything else. The background becomes transparent while the subject keeps its original detail and edges. The model is downloaded once, then reused, so later images process faster.',
      },
      {
        heading: 'What it is good for',
        body: 'Product photos for online shops, profile pictures, presentation slides, thumbnails, and stickers all benefit from a clean cut-out. It works best on images with a clear subject and reasonable lighting. Fine details such as flyaway hair or a glass object with a see-through edge are the hardest cases for any automatic tool, so check the result before publishing.',
      },
      {
        heading: 'Your image stays private',
        body: 'Most background removers upload your photo to a server and send the result back. This one runs the model locally, which means the image is never transmitted. That matters for photos of people, unreleased products and anything you would rather not hand to a third party.',
      },
    ],
    features: [
      'One-click background removal',
      'Transparent PNG output',
      'AI model runs on your device',
      'No upload and no account',
      'Before and after preview',
      'Works on people, products and pets',
    ],
    faq: [
      {
        q: 'Is my photo uploaded to a server?',
        a: 'No. The AI model runs in your browser. Your image is processed on your device and never sent anywhere.',
      },
      {
        q: 'Why does the first image take longer?',
        a: 'The model itself has to be downloaded the first time you use the tool. After that it is cached, so subsequent images are much quicker.',
      },
      {
        q: 'What format is the result?',
        a: 'A PNG with a transparent background, which you can place on any colour and open in any image editor.',
      },
      {
        q: 'Can it remove the background from a logo?',
        a: 'Yes, if the logo sits on a fairly plain background. Very detailed or low-contrast edges may need a touch-up in an editor afterwards.',
      },
    ],
  },

  'qr-code': {
    intro:
      'QR codes turn a camera into a shortcut: point a phone at the square and it opens a link, joins a WiFi network, starts a call or adds a contact. This tool creates custom QR codes and also scans them, from your camera or from an image you already have.',
    sections: [
      {
        heading: 'Creating a QR code',
        body: 'Choose what the code should do — open a website, show text, send an email, dial a number, send an SMS or join a WiFi network — then fill in the fields. Adjust the colours, size and quiet zone, and optionally place a logo in the centre. The code updates as you type, and you can download it as a PNG for print or screen.',
      },
      {
        heading: 'Making codes that scan reliably',
        body: 'Keep strong contrast between the code and its background: dark modules on a light background scan best. Leave the white margin, called the quiet zone, intact around the edge. Avoid placing a logo so large that it covers more than about a quarter of the code, since that can stop some scanners reading it. Test the final code with a real phone before you print thousands of copies.',
      },
      {
        heading: 'Scanning a QR code',
        body: 'Switch to the scanner and either point your camera at a code or upload a screenshot. The decoder reads it instantly and shows the contents, with a link you can open. Everything happens locally, so a code that contains private information is not sent to a decoding service.',
      },
    ],
    features: [
      'Generate codes for links, text, email, phone, SMS and WiFi',
      'Custom foreground and background colours',
      'Adjustable size and quiet zone',
      'Optional centre logo',
      'Scan from camera or from an image',
      'Download as PNG or SVG',
    ],
    faq: [
      {
        q: 'Do QR codes expire?',
        a: 'A code that contains a plain link never expires — it is just an image of the link. Only codes from services that route through a shortener can stop working, and this tool does not use one.',
      },
      {
        q: 'Can I use my own logo in the centre?',
        a: 'Yes. Upload an image and it is placed in the middle of the code. Keep it small enough that the code still scans.',
      },
      {
        q: 'Why will my QR code not scan?',
        a: 'The usual causes are low contrast, a missing quiet zone, a logo that is too large, or printing at a very small size. Increase the contrast and size and try again.',
      },
      {
        q: 'Is it safe to scan unknown codes?',
        a: 'Treat a code like a link from a stranger. The scanner shows you the contents before you open anything, so you can decide.',
      },
    ],
  },

  'code-formatter': {
    intro:
      'Minified code is efficient for machines and unreadable for people. This formatter takes HTML, CSS, JavaScript or JSON and re-indents it into something you can actually read, or does the opposite and compresses it to the smallest possible size.',
    sections: [
      {
        heading: 'Beautify or minify',
        body: 'Paste your code, pick the language, and choose Beautify to add indentation and line breaks or Minify to strip whitespace and comments. JSON is validated as it is formatted, so a syntax error is reported with its position instead of silently producing broken output. Copy the result or download it as a file.',
      },
      {
        heading: 'Where each mode helps',
        body: 'Beautifying is the fastest way to understand code you did not write — a bundled script, a snippet from a support forum, or a config file someone sent you. Minifying is the last step before you publish: removing whitespace from CSS and JavaScript shaves kilobytes off every page load, which matters most on mobile connections.',
      },
      {
        heading: 'Working safely with code',
        body: 'Source code can contain secrets: API keys, internal URLs, customer data. Because this formatter runs entirely in your browser, pasting proprietary code does not send it to a third party. It is still worth being careful about pasting credentials anywhere, but nothing leaves your machine here.',
      },
    ],
    features: [
      'Format and beautify HTML, CSS, JavaScript and JSON',
      'Minify to reduce file size',
      'JSON validation with error positions',
      'Copy or download the result',
      'Handles large files',
      'Runs locally — your code is not uploaded',
    ],
    faq: [
      {
        q: 'Does minifying break my code?',
        a: 'Minifying only removes whitespace and comments, which JavaScript and CSS ignore. Always test the minified output before deploying, since a rare edge case such as a missing semicolon can behave differently.',
      },
      {
        q: 'Can it fix invalid JSON?',
        a: 'It reports where the error is rather than guessing a repair. Fix the reported position and format again.',
      },
      {
        q: 'Is my code uploaded?',
        a: 'No. All formatting runs in your browser, so proprietary or sensitive code stays on your device.',
      },
      {
        q: 'Which languages are supported?',
        a: 'HTML, CSS, JavaScript and JSON, which cover the files most people need to tidy up or shrink.',
      },
    ],
  },

  'color-tools': {
    intro:
      'Choosing colours is easier when you can see the values behind them. This tool picks colours and shows the HEX, RGB and HSL codes, pulls a colour straight out of an image, builds matching palettes and generates ready-to-paste CSS gradients.',
    sections: [
      {
        heading: 'Pick, convert and copy',
        body: 'Use the picker to choose a colour, or type a HEX, RGB or HSL value directly. Every representation updates at once, so you can move between formats without converting by hand. Copy a single value or the whole set with one click.',
      },
      {
        heading: 'Palettes and harmonies',
        body: 'Starting from your chosen colour, the tool generates harmonious sets: complementary (the opposite hue), analogous (neighbours on the wheel), triadic and more. These are useful starting points for a brand palette or a chart, and you can copy every swatch as HEX in one go.',
      },
      {
        heading: 'Gradients and the eyedropper',
        body: 'Build a linear or radial gradient from two or more colours, set the angle, and copy the CSS. The eyedropper reads a colour from any image you load, which is the quick way to match an existing design or pull a palette out of a photograph.',
      },
    ],
    features: [
      'Live HEX, RGB and HSL values',
      'Eyedropper to sample colours from an image',
      'Complementary, analogous and triadic palettes',
      'Copy all swatches as HEX',
      'Linear and radial CSS gradient generator',
      'No account and nothing to install',
    ],
    faq: [
      {
        q: 'What is the difference between HEX, RGB and HSL?',
        a: 'They describe the same colour in different ways. HEX and RGB give the red, green and blue amounts; HSL describes hue, saturation and lightness, which is often easier to adjust by hand.',
      },
      {
        q: 'How do I pick a colour from a photo?',
        a: 'Load the image and use the eyedropper, then click the spot you want. The sampled colour appears in all three formats.',
      },
      {
        q: 'Can I copy the gradient as CSS?',
        a: 'Yes. Set the colours and angle, then copy the generated background property and paste it into your stylesheet.',
      },
      {
        q: 'Is the palette accessible?',
        a: 'The tool shows the colours and their values. To check contrast for text, pair it with a contrast checker and aim for a ratio of at least 4.5 to 1 for body text.',
      },
    ],
  },

  'youtube-thumbnail': {
    intro:
      'Every YouTube video has a set of thumbnail images at different sizes, and they are public even when the video is unlisted. This tool pulls all available thumbnails from a link so you can preview and download the one you need.',
    sections: [
      {
        heading: 'How to download a thumbnail',
        body: 'Paste a YouTube link in any of its common forms — a full watch URL, a shortened youtu.be link, a shorts link or the video ID on its own. The tool lists every thumbnail resolution the video offers, from the small default up to the full-size 1080p version, and each one downloads with a single click.',
      },
      {
        heading: 'Which resolution to choose',
        body: 'The maximum-resolution image is best for a blog post header or a slide. The 720p version is lighter and usually indistinguishable at the size most people view. The standard 480×360 version is fine for a small preview. Very new or private videos may not yet have the largest sizes, in which case the tool simply shows what exists.',
      },
      {
        heading: 'Using thumbnails fairly',
        body: 'Thumbnails belong to the video owner. Downloading one to illustrate a review, a commentary or a news article is common practice, but you should credit the channel and avoid implying that the creator endorses your page. For commercial use, ask the owner for permission.',
      },
    ],
    features: [
      'Works with watch, youtu.be and shorts links',
      'Lists every available resolution',
      'Includes the full-size 1080p image',
      'One-click download',
      'No login required',
      'Handles pasted video IDs too',
    ],
    faq: [
      {
        q: 'Can I download the thumbnail of any video?',
        a: 'Yes, if the video is public or unlisted. Private videos do not expose their images, and a brand-new upload may not have the larger sizes yet.',
      },
      {
        q: 'Is the highest resolution always available?',
        a: 'Not always. The largest thumbnail is generated a short time after upload, so a very recent video may show fewer sizes.',
      },
      {
        q: 'Is it legal to use a thumbnail?',
        a: 'It belongs to the video owner. Using it for commentary or a review is usually fine with credit; commercial use needs permission.',
      },
      {
        q: 'Does this work for YouTube Shorts?',
        a: 'Yes. Paste a shorts link and the available thumbnail sizes are listed as usual.',
      },
    ],
  },

  'my-ip': {
    intro:
      'Your public IP address is how the wider internet identifies your connection. This page shows it in large type, along with your provider, an approximate location, time zone and network details — useful when you are setting up a server, checking a VPN or troubleshooting a connection.',
    sections: [
      {
        heading: 'What you will see',
        body: 'The page reports your public IPv4 or IPv6 address, the organisation that owns it, your internet service provider and autonomous system number, an approximate city and country, your time zone and postal area, and the user agent your browser sends. A map shows the approximate location, which is based on your provider rather than your exact position.',
      },
      {
        heading: 'Public versus private addresses',
        body: 'Your device also has private addresses, such as 192.168.x.x, used inside your home network. Those never appear on the internet. The address shown here is the public one that websites see, and it is shared by every device on your network unless you use a VPN.',
      },
      {
        heading: 'Why your IP changes and how to hide it',
        body: 'Most home connections use a dynamic address that your provider reassigns periodically, which is why it can change from week to week. A VPN replaces your address with one of its own, which hides your provider and rough location from the sites you visit. If the location shown is far from you, that usually means your provider routes traffic through a regional hub, not that anything is wrong.',
      },
    ],
    features: [
      'Public IPv4 or IPv6 address in large type',
      'ISP, organisation and ASN details',
      'Approximate city, country and time zone',
      'Map of the approximate location',
      'VPN and proxy indicators',
      'One-click copy of the address',
    ],
    faq: [
      {
        q: 'Is my exact location shown?',
        a: 'No. The location is derived from your internet provider and is approximate, often placing you in a nearby city or a regional data centre.',
      },
      {
        q: 'Why does the location look wrong?',
        a: 'Providers route traffic through hubs, and mobile networks often exit in a different city. The result reflects the network, not your GPS position.',
      },
      {
        q: 'Can websites see this information?',
        a: 'Every site you visit can see your IP address, and geolocation databases can estimate a region from it. A VPN masks it.',
      },
      {
        q: 'Is this tool safe to use?',
        a: 'Yes. It asks a public lookup service to report the address your request came from — the same address every website already sees.',
      },
    ],
  },

  'speed-test': {
    intro:
      'An internet plan promises a certain speed, but what you actually get varies with the time of day, your Wi-Fi and the distance to the server. This test measures your latency, download speed and upload speed against a global network, and shows how the connection rates overall.',
    sections: [
      {
        heading: 'What the numbers mean',
        body: 'Ping is the round-trip time for a small request, measured in milliseconds; lower is better, and anything under about 30 ms feels instant for browsing and calls. Download speed is how fast data reaches you, which matters for streaming and large files. Upload speed is how fast you send data, which matters for video calls, backups and posting. Jitter is how much the ping varies, and low jitter keeps calls steady.',
      },
      {
        heading: 'Getting an accurate result',
        body: 'Close other tabs and downloads, move closer to the router or use a cable, and run the test a couple of times at different hours. Wi-Fi, especially on the far side of a wall, is often the real bottleneck rather than the connection itself. Testing on a wired connection tells you what the line can do; testing over Wi-Fi tells you what you actually experience.',
      },
      {
        heading: 'Why results differ from your plan',
        body: 'Providers advertise a maximum, not a guarantee. Peak-hour congestion, older cabling, a busy household and the server you reach all affect the figure. If a wired test is consistently far below your plan, that is the number to raise with your provider.',
      },
    ],
    features: [
      'Latency, download and upload measurements',
      'Live speedometer as the test runs',
      'Jitter reading for call quality',
      'Connection quality rating',
      'Runs against a global edge network',
      'Retest as often as you like',
    ],
    faq: [
      {
        q: 'Why is my speed lower than my plan?',
        a: 'Plans quote a maximum. Wi-Fi, congestion at busy times and the route to the server all reduce the figure. A wired test shows the true line speed.',
      },
      {
        q: 'What is a good ping?',
        a: 'Under 30 ms feels instant for browsing and video calls. Under 60 ms is fine for most uses. Above about 100 ms you may notice lag in games and calls.',
      },
      {
        q: 'Does the test use much data?',
        a: 'It transfers a moderate amount for a short period. On a metered connection, keep an eye on usage if you test repeatedly.',
      },
      {
        q: 'Should I test on Wi-Fi or cable?',
        a: 'Test both. The wired result shows what your line delivers; the Wi-Fi result shows what you actually get in the room where you work.',
      },
    ],
  },

  'password-generator': {
    intro:
      'Weak, reused passwords are behind a large share of account takeovers. This tool creates strong random passwords with the length and character mix you choose, and checks how long an existing password would take to crack — all on your device, so nothing is transmitted.',
    sections: [
      {
        heading: 'Generating a strong password',
        body: 'Set the length and decide whether to include uppercase letters, digits and symbols, then generate. Longer is almost always stronger: a random sixteen-character password with mixed characters is far harder to guess than a short one packed with symbols. Copy the result straight into your password manager, and generate a fresh one for every account rather than reusing a favourite.',
      },
      {
        heading: 'Checking password strength',
        body: 'The checker estimates how many guesses an attacker would need and how long that would take at a realistic rate. It looks at length and the variety of characters, not at any stored list of breached passwords, so the estimate is a guide rather than a verdict. A password that is long but made of dictionary words is weaker than its length suggests.',
      },
      {
        heading: 'Why local generation is safer',
        body: 'A password generated on a website and sent back over the network could, in principle, be seen by that site. Here the random values come from your browser\'s cryptographic generator and never leave your device, which is the only way to be sure a password is known to nobody else.',
      },
    ],
    features: [
      'Generate passwords up to any practical length',
      'Choose letters, digits and symbols',
      'See the number of possible combinations',
      'Estimate crack time for an existing password',
      'Cryptographically secure randomness',
      'Nothing is sent to a server',
    ],
    faq: [
      {
        q: 'How long should a password be?',
        a: 'Sixteen characters or more for anything important. Length adds far more strength than swapping letters for symbols.',
      },
      {
        q: 'Is it safe to generate a password here?',
        a: 'Yes. The password is created by your browser and never leaves your device, so no server ever sees it.',
      },
      {
        q: 'Should I reuse a strong password?',
        a: 'No. Reuse means one breach exposes every account that shares the password. Generate a unique one per site and store them in a password manager.',
      },
      {
        q: 'Are passphrases better than random strings?',
        a: 'A long passphrase of several random words can be both strong and memorable. The key is true randomness and enough length.',
      },
    ],
  },

  'wifi-qr': {
    intro:
      'Typing a long Wi-Fi password on a phone is fiddly, especially for guests. A Wi-Fi QR code lets anyone join by pointing their camera at it. This tool builds that code from your network name and password and can lay it out as a printable card.',
    sections: [
      {
        heading: 'Creating a Wi-Fi QR code',
        body: 'Enter your network name (the SSID) exactly as it appears, choose the security type — usually WPA or WPA2 — and type the password. The code is generated as you go. Download it as an image, print it, or leave it on screen for guests to scan. Open networks need no password, and the tool supports that too.',
      },
      {
        heading: 'Placing the code',
        body: 'Put the printed code where guests can reach it: a guest room, a café table, a waiting area. Keep the print large enough for a phone camera to focus easily, and keep good contrast. For a shop or office, a small framed card works well; for a home, a note on the fridge is enough.',
      },
      {
        heading: 'A word about sharing your password',
        body: 'A Wi-Fi QR code contains your password in a form any phone can read, so anyone who can see the code can join. Treat a printed code as you would the password itself: do not post it publicly, and change the password if the code has been shared more widely than you intended.',
      },
    ],
    features: [
      'Supports WPA, WPA2, WEP and open networks',
      'Instant code as you type',
      'Downloadable image',
      'Printable card layout',
      'Custom colours and size',
      'Generated on your device',
    ],
    faq: [
      {
        q: 'Which security type should I choose?',
        a: 'WPA or WPA2 for almost every modern network. Choose WEP only for old equipment, and none for an open network with no password.',
      },
      {
        q: 'Does the code expose my password?',
        a: 'Yes. The code encodes the password so phones can join automatically. Anyone who can see the code can read it, so share it only with people you trust.',
      },
      {
        q: 'Will it work on any phone?',
        a: 'Modern iOS and Android cameras recognise Wi-Fi QR codes natively. Older devices may need a QR scanner app.',
      },
      {
        q: 'Can I put the code on a website?',
        a: 'You can, but remember that publishing it publishes your password. Use it only for networks you are happy to share publicly.',
      },
    ],
  },

  'word-counter': {
    intro:
      'Writers, students and anyone working to a limit needs to know how long a piece of text is. This counter reports words, characters, sentences, paragraphs and reading time as you type, along with keyword density and quick case conversion.',
    sections: [
      {
        heading: 'What is counted',
        body: 'The panel updates live with the number of words, characters with and without spaces, sentences, paragraphs and unique words, plus an estimate of reading and speaking time. Keyword density shows which words appear most often, which helps you spot accidental repetition or check that a piece stays on topic.',
      },
      {
        heading: 'Working to a limit',
        body: 'Essays, university applications, social posts and meta descriptions all have limits. Paste the text here and trim until the count fits. Character counts matter especially for titles and descriptions that get cut off in search results, where a rough guide is about sixty characters for a title and one hundred and sixty for a description.',
      },
      {
        heading: 'Case conversion and cleanup',
        body: 'Convert the whole text to upper, lower, title or sentence case in one click, which saves retyping a heading or fixing text that was pasted in capitals. Reading time is based on an average adult pace, so treat it as a guide rather than an exact figure.',
      },
    ],
    features: [
      'Live word, character and sentence counts',
      'Paragraph and unique-word counts',
      'Reading and speaking time estimates',
      'Keyword density',
      'Upper, lower, title and sentence case',
      'Nothing typed here is uploaded',
    ],
    faq: [
      {
        q: 'How is reading time calculated?',
        a: 'It uses a typical adult reading pace of around 200 to 250 words per minute, so it is an estimate rather than a precise measure.',
      },
      {
        q: 'Does it count characters with and without spaces?',
        a: 'Both. Many forms and platforms count spaces, while others do not, so the tool shows each.',
      },
      {
        q: 'Is my text stored or sent anywhere?',
        a: 'No. Counting happens in your browser as you type, and the text never leaves your device.',
      },
      {
        q: 'What counts as a word?',
        a: 'A run of characters separated by spaces or punctuation, which matches how most word processors count.',
      },
    ],
  },

  'text-to-speech': {
    intro:
      'Sometimes the easiest way to check a piece of writing is to hear it read back. This tool uses the voices built into your browser to speak any text aloud, with control over the voice, speed, pitch and volume.',
    sections: [
      {
        heading: 'Making your text speak',
        body: 'Paste or type your text, choose a voice from the list your device offers, and adjust speed, pitch and volume to taste. Press play to start and use pause or stop at any point. A word count and estimated spoken length help you judge how long a passage will take before you start.',
      },
      {
        heading: 'Where it helps',
        body: 'Listening back to an essay or an email is a quick way to catch awkward phrasing, repeated words and sentences that do not flow. It is also useful for proofreading, for reading a document while your hands are busy, and for checking how a script sounds before recording it.',
      },
      {
        heading: 'About the voices',
        body: 'The voices come from your operating system and browser, so the list differs between devices. Some are more natural than others, and a few can be downloaded for offline use. Because the speech is generated locally, your text is not sent to a cloud service to be read.',
      },
    ],
    features: [
      'Uses the voices already on your device',
      'Adjustable speed, pitch and volume',
      'Play, pause and stop controls',
      'Word count and estimated length',
      'No upload of your text',
      'Works offline with installed voices',
    ],
    faq: [
      {
        q: 'Why do I not hear anything?',
        a: 'Check your device volume first, then confirm a voice is selected. Some browsers load their voice list a moment after the page opens.',
      },
      {
        q: 'Can I download the audio as a file?',
        a: 'Not directly. The voices speak in real time rather than rendering a file, so record your system audio if you need a saved clip.',
      },
      {
        q: 'Why do the available voices differ on another device?',
        a: 'The list comes from your operating system. Different devices and browsers offer different voices and languages.',
      },
      {
        q: 'Is my text sent to a server?',
        a: 'No. The browser\'s built-in speech engine reads the text locally, so nothing is uploaded.',
      },
    ],
  },

  'loan-calculator': {
    intro:
      'A loan is easier to judge when you can see what it really costs. This calculator works out the monthly instalment, the total interest and the total repayment for any amount, rate and term, with an amortisation breakdown and a chart of how the balance falls over time.',
    sections: [
      {
        heading: 'How EMI is calculated',
        body: 'The monthly instalment, often called EMI, is worked out from the loan amount, the annual interest rate and the number of monthly payments using the standard amortisation formula. Each payment covers the interest due that month plus a slice of the principal. Early payments are mostly interest; later ones are mostly principal, which is why the balance falls slowly at first and then faster.',
      },
      {
        heading: 'Reading the results',
        body: 'The summary shows the monthly instalment, the total interest paid over the life of the loan and the total amount repaid. The table breaks the loan into periods so you can see how much of each payment goes to interest versus principal, and the chart makes the crossover point easy to spot.',
      },
      {
        heading: 'Comparing offers',
        body: 'A longer term lowers the monthly payment but raises the total interest, sometimes by a large amount. A shorter term costs more each month but far less overall. Enter two offers with the same amount and different rates or terms and compare the total repayment figure, which is the number that matters most.',
      },
    ],
    features: [
      'Monthly instalment, total interest and total repayment',
      'Interactive sliders for amount, rate and term',
      'Amortisation table by period',
      'Principal versus interest chart',
      'Choose your currency',
      'Works for any loan type',
    ],
    faq: [
      {
        q: 'What does EMI mean?',
        a: 'Equated Monthly Instalment — the fixed amount you pay each month, covering both interest and part of the principal.',
      },
      {
        q: 'Is a shorter or longer term better?',
        a: 'A longer term means smaller monthly payments but more total interest. A shorter term costs more per month but far less overall. It depends on what you can afford each month.',
      },
      {
        q: 'Does this include fees and insurance?',
        a: 'No. It models the loan itself. Add any arrangement fees or insurance separately to see the full cost.',
      },
      {
        q: 'Can I use it for a mortgage or car loan?',
        a: 'Yes. Any loan with a fixed rate and regular monthly payments works the same way.',
      },
    ],
  },

  'bmi-calculator': {
    intro:
      'Body mass index is a quick, widely used screening measure that relates your weight to your height. This calculator reports your BMI with a healthy-range gauge, estimates your daily calorie needs from your activity level and shows an ideal weight range.',
    sections: [
      {
        heading: 'What BMI measures',
        body: 'BMI is your weight in kilograms divided by your height in metres squared. It places adults into broad bands: underweight, healthy, overweight and obese. It is a screening tool, not a diagnosis. Muscular people can register as overweight despite low body fat, and BMI does not distinguish fat from muscle or show where fat is stored.',
      },
      {
        heading: 'Daily calories and ideal weight',
        body: 'The calculator estimates your basal metabolic rate — the energy you would burn at rest — and multiplies it by an activity factor to give a daily calorie figure for maintaining your current weight. It also shows a weight range associated with a healthy BMI for your height, in metric or imperial units.',
      },
      {
        heading: 'Using the result sensibly',
        body: 'Treat the numbers as a starting point for a conversation, not a verdict. Waist measurement, fitness, diet quality and how you feel all matter. If you are planning a significant change to your weight or diet, speak to a doctor or dietitian who can consider your full health picture.',
      },
    ],
    features: [
      'BMI with a healthy-range gauge',
      'Metric and imperial input',
      'Daily calorie estimate from activity level',
      'Basal metabolic rate and TDEE',
      'Healthy weight range for your height',
      'Nothing you enter is uploaded',
    ],
    faq: [
      {
        q: 'Is BMI accurate for everyone?',
        a: 'No. It does not distinguish muscle from fat and is less useful for athletes, pregnant people, children and older adults. Use it as a rough guide only.',
      },
      {
        q: 'What is a healthy BMI?',
        a: 'For most adults, a BMI between about 18.5 and 24.9 is considered healthy, though the right range varies with build and background.',
      },
      {
        q: 'What is TDEE?',
        a: 'Total Daily Energy Expenditure — the calories you burn in a day including activity. Eating around your TDEE maintains weight.',
      },
      {
        q: 'Should I use this to plan a diet?',
        a: 'Use it as a starting estimate, and consult a doctor or dietitian before making significant changes to how you eat.',
      },
    ],
  },

  'age-calculator': {
    intro:
      'How old you are exactly depends on the unit you measure in. This calculator gives your age in years, months, days, hours and minutes, counts down live to your next birthday, and measures the gap between any two dates.',
    sections: [
      {
        heading: 'Exact age and birthday countdown',
        body: 'Enter your date of birth and the tool reports your precise age in several units at once — years and months, total months, weeks, days, hours and minutes — plus a live countdown to your next birthday showing the days and hours remaining.',
      },
      {
        heading: 'Date difference',
        body: 'Switch to the date-difference mode to measure the span between any two dates. This is handy for working out notice periods, project timelines, the length of a stay or the days until an event. The result is shown in days, weeks and months.',
      },
      {
        heading: 'Why the count varies',
        body: 'Months have different lengths and leap years add a day every four years, so an age in months is not simply years multiplied by twelve. The calculator counts calendar-correct months and days, which is why it can differ slightly from a rough mental estimate.',
      },
    ],
    features: [
      'Age in years, months, days, hours and minutes',
      'Live countdown to the next birthday',
      'Date difference between any two dates',
      'Handles leap years correctly',
      'Clear breakdown in multiple units',
      'Runs entirely in your browser',
    ],
    faq: [
      {
        q: 'How is age calculated?',
        a: 'By counting complete calendar years, months and days between your date of birth and the chosen date, so month lengths and leap years are handled correctly.',
      },
      {
        q: 'Can I find the difference between two dates?',
        a: 'Yes. Use the date-difference mode and enter a start and end date.',
      },
      {
        q: 'Does it handle leap years?',
        a: 'Yes. February 29 and leap years are accounted for in the count.',
      },
      {
        q: 'Can I calculate age at a past or future date?',
        a: 'Yes. Set the "age at" date to any point in time to see how old someone was or will be then.',
      },
    ],
  },

  'unit-converter': {
    intro:
      'Mixing units is a common source of mistakes, whether you are cooking, building, travelling or sizing a file. This converter handles length, weight, temperature, area, speed and digital storage, and converts currencies using live exchange rates.',
    sections: [
      {
        heading: 'Converting units',
        body: 'Pick a category, enter a value, choose the units you are converting from and to, and the result appears instantly. The swap button reverses the direction. Categories cover the everyday needs: metres and feet, kilograms and pounds, Celsius and Fahrenheit, square metres and acres, kilometres per hour and miles per hour, and bytes through terabytes.',
      },
      {
        heading: 'Digital storage and currencies',
        body: 'Storage conversions handle the difference between decimal units, where a kilobyte is a thousand bytes, and binary units, which is why a drive advertised as 1 TB shows less in some tools. Currency conversion fetches current exchange rates from a public rates service, so the figure reflects the market rather than a fixed table.',
      },
      {
        heading: 'Getting the right result',
        body: 'Check the direction before you read the answer, especially with temperature, where the offset makes the conversion non-linear. For currencies, remember that the rate is mid-market and the amount your bank or card gives you will differ slightly after fees and spreads.',
      },
    ],
    features: [
      'Length, weight, temperature, area and speed',
      'Digital storage from bytes to terabytes',
      'Live currency exchange rates',
      'One-click swap between units',
      'Instant results as you type',
      'No account required',
    ],
    faq: [
      {
        q: 'Are the currency rates live?',
        a: 'Yes. They are fetched from a public exchange-rate service when you use the currency category, so they reflect recent market rates.',
      },
      {
        q: 'Why does my drive show less space than advertised?',
        a: 'Drive makers use decimal units, where 1 TB is a trillion bytes, while some systems report binary units. The difference explains most of the shortfall.',
      },
      {
        q: 'Is the temperature conversion linear?',
        a: 'No. Celsius and Fahrenheit have different zero points, so the conversion includes an offset rather than a simple multiplication.',
      },
      {
        q: 'Can I convert between any two units?',
        a: 'Within a category, yes. Pick any from-unit and to-unit and the result updates immediately.',
      },
    ],
  },

  stopwatch: {
    intro:
      'A stopwatch, a countdown timer and a set of world clocks in one page. Time laps precisely, set a timer that alerts you when it ends, and see the current time in major cities without reaching for another app.',
    sections: [
      {
        heading: 'Stopwatch with laps',
        body: 'Start, stop and reset with a single tap, and record lap times as you go. Each lap is listed with its split, which is useful for interval training, presentations, experiments or any task where you need to know how long each stage took.',
      },
      {
        heading: 'Countdown timer',
        body: 'Set a duration and start the countdown. When it reaches zero the timer alerts you so you can step away from the screen. It is handy for cooking, workouts, focused work sessions and meetings.',
      },
      {
        heading: 'World clocks',
        body: 'The world-clock panel shows the current time in several major cities at once, which makes scheduling a call across time zones much easier. Times update automatically, so you always see the live reading.',
      },
    ],
    features: [
      'Precise stopwatch with lap times',
      'Countdown timer with an alert',
      'Multiple world clocks',
      'Start, stop and reset controls',
      'Large, readable digits',
      'Works offline',
    ],
    faq: [
      {
        q: 'How accurate is the stopwatch?',
        a: 'It uses your device clock and updates to hundredths of a second, which is accurate enough for everyday timing and most training.',
      },
      {
        q: 'Will the timer still run if I switch tabs?',
        a: 'Yes. The timer keeps counting while the page is open in a background tab, and alerts you when it finishes.',
      },
      {
        q: 'Which cities are shown on the world clock?',
        a: 'A selection of major cities across different time zones. Each shows the current local time there.',
      },
      {
        q: 'Can I run the stopwatch and timer together?',
        a: 'They are separate panels. Use whichever you need; both work independently.',
      },
    ],
  },
}

export function getToolContent(slug: string): ToolContent | undefined {
  return TOOL_CONTENT[slug]
}

export const CONTENT_UPDATED = UPDATED
