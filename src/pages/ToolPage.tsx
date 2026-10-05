import { TOOL_BY_SLUG } from '@/data/tools'
import NotFound from './NotFound'

import ImageConverter from '@/tools/ImageConverter'
import ImageResizer from '@/tools/ImageResizer'
import BackgroundRemover from '@/tools/BackgroundRemover'
import ColorTools from '@/tools/ColorTools'
import YoutubeThumbnail from '@/tools/YoutubeThumbnail'
import ScreenRecorder from '@/tools/ScreenRecorder'
import PdfTools from '@/tools/PdfTools'
import CodeFormatter from '@/tools/CodeFormatter'
import MyIp from '@/tools/MyIp'
import SpeedTest from '@/tools/SpeedTest'
import PasswordGenerator from '@/tools/PasswordGenerator'
import WifiQr from '@/tools/WifiQr'
import WordCounter from '@/tools/WordCounter'
import TextToSpeech from '@/tools/TextToSpeech'
import QrCodeTool from '@/tools/QrCodeTool'
import LoanCalculator from '@/tools/LoanCalculator'
import BmiCalculator from '@/tools/BmiCalculator'
import AgeCalculator from '@/tools/AgeCalculator'
import UnitConverter from '@/tools/UnitConverter'
import Stopwatch from '@/tools/Stopwatch'
import type { ToolMeta } from '@/data/tools'

type ToolComponent = (props: { tool: ToolMeta }) => JSX.Element

const REGISTRY: Record<string, ToolComponent> = {
  'image-converter': ImageConverter,
  'image-resizer': ImageResizer,
  'background-remover': BackgroundRemover,
  'color-tools': ColorTools,
  'youtube-thumbnail': YoutubeThumbnail,
  'screen-recorder': ScreenRecorder,
  'pdf-tools': PdfTools,
  'code-formatter': CodeFormatter,
  'my-ip': MyIp,
  'speed-test': SpeedTest,
  'password-generator': PasswordGenerator,
  'wifi-qr': WifiQr,
  'word-counter': WordCounter,
  'text-to-speech': TextToSpeech,
  'qr-code': QrCodeTool,
  'loan-calculator': LoanCalculator,
  'bmi-calculator': BmiCalculator,
  'age-calculator': AgeCalculator,
  'unit-converter': UnitConverter,
  stopwatch: Stopwatch,
}

export default function ToolPage({ slug }: { slug: string }) {
  const tool = TOOL_BY_SLUG[slug]
  const Component = REGISTRY[slug]
  if (!tool || !Component) return <NotFound />
  return <Component tool={tool} />
}
