// Jeu d'icones unique de l'app : Icons8 style "Hatch", vendorise en local et rendu
// via masque CSS (voir Icon.tsx). Remplace lucide-react (filaire generique) - les
// noms d'export reprennent volontairement le vocabulaire lucide utilise dans les
// ecrans pour que la migration soit un simple changement de ligne d'import, et que
// tout nouvel ecran trouve ses reperes.

import { Icon, type IconProps } from './Icon'
import { ICON_URLS, type IconName } from './registry'

export { Icon, ICON_URLS }
export type { IconProps, IconName }

type GlyphProps = Omit<IconProps, 'src'>

function makeIcon(name: IconName) {
  function Glyph(props: GlyphProps) {
    return <Icon src={ICON_URLS[name]} {...props} />
  }
  Glyph.displayName = `Icon(${name})`
  return Glyph
}

// Navigation et chrome
export const ArrowLeft = makeIcon('arrowLeft')
export const ArrowRight = makeIcon('arrowRight')
export const Home = makeIcon('home')
export const X = makeIcon('close')
export const CircleHelp = makeIcon('help')
export const Settings = makeIcon('gear')
export const SlidersHorizontal = makeIcon('sliders')
export const Settings2 = makeIcon('sliders')
export const Sun = makeIcon('sun')
export const Moon = makeIcon('moon')
export const Info = makeIcon('info')

// Actions
export const Check = makeIcon('check')
export const Plus = makeIcon('plus')
export const Minus = makeIcon('minus')
export const Pencil = makeIcon('pencil')
export const PenLine = makeIcon('pencil')
export const PencilLine = makeIcon('pencil')
export const Trash2 = makeIcon('trash')
export const RotateCcw = makeIcon('restart')
export const TimerReset = makeIcon('stopwatch')
export const Share2 = makeIcon('share')
export const Eye = makeIcon('eye')
export const EyeOff = makeIcon('eyeOff')
export const DoorOpen = makeIcon('doorExit')
export const Play = makeIcon('play')
export const LoaderCircle = makeIcon('loader')

// Univers du jeu
export const Spade = makeIcon('suitSpade')
export const Heart = makeIcon('suitHeart')
export const Club = makeIcon('suitClub')
export const Diamond = makeIcon('suitDiamond')
export const Crown = makeIcon('crown')
export const Gem = makeIcon('gem')
export const Sword = makeIcon('sword')
export const Sparkles = makeIcon('sparkle')
export const Dices = makeIcon('dice')
export const Disc3 = makeIcon('wheel')
export const Layers = makeIcon('layers')
export const InfinityIcon = makeIcon('infinity')
export const Clock = makeIcon('clock')
export const Brain = makeIcon('brain')
export const Flame = makeIcon('flame')
export const Medal = makeIcon('medal')
export const Megaphone = makeIcon('megaphone')
export const Gavel = makeIcon('gavel')
export const Scale = makeIcon('scale')
export const ScrollText = makeIcon('scroll')
export const Receipt = makeIcon('receipt')
export const ThumbsUp = makeIcon('thumbsUp')
export const ThumbsDown = makeIcon('thumbsDown')

// Tablee et statuts
export const Users = makeIcon('users')
export const UserPlus = makeIcon('userPlus')
export const Lock = makeIcon('lock')
export const ShieldCheck = makeIcon('shield')
export const Cookie = makeIcon('cookie')
export const PartyPopper = makeIcon('party')
export const WifiOff = makeIcon('wifiOff')
