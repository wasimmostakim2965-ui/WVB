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
  Volume2,
  Wifi,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import {
  CATEGORIES,
  TOOLS as RECORDS,
  type Category,
  type ToolIconName,
  type ToolRecord,
} from './catalog'

export { CATEGORIES }
export type { Category, ToolIconName, ToolRecord }

const ICONS: Record<ToolIconName, LucideIcon> = {
  fileText: FileText,
  image: ImageIcon,
  crop: Crop,
  scissors: Scissors,
  qrCode: QrCode,
  braces: Braces,
  palette: Palette,
  youtube: Youtube,
  globe: Globe,
  gauge: Gauge,
  keyRound: KeyRound,
  wifi: Wifi,
  type: Type,
  volume2: Volume2,
  landmark: Landmark,
  heartPulse: HeartPulse,
  cake: Cake,
  arrowLeftRight: ArrowLeftRight,
  timer: Timer,
}

/** A tool record with its icon component attached, ready for the UI to render. */
export interface ToolMeta extends ToolRecord {
  icon: LucideIcon
}

export const TOOLS: ToolMeta[] = RECORDS.map((tool) => ({ ...tool, icon: ICONS[tool.iconName] }))

export const TOOL_BY_SLUG: Record<string, ToolMeta> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t]),
)

export const POPULAR_TOOLS: ToolMeta[] = TOOLS.filter((t) => t.popular)

export function toolsByCategory(): { category: Category; tools: ToolMeta[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((group) => group.tools.length > 0)
}

