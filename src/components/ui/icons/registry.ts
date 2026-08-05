// Registre des icones Icons8 Hatch vendorisees (src/assets/icons/ui, regle zero
// CDN). Les PNG sont importes via Vite : ils partent dans le bundle avec un hash,
// donc precaches par le service worker et disponibles hors ligne.
// Reproduire ou etendre le jeu : node scripts/fetch-ui-icons.mjs.

import arrowLeft from '@/assets/icons/ui/arrow-left.png'
import arrowRight from '@/assets/icons/ui/arrow-right.png'
import book from '@/assets/icons/ui/book.png'
import brain from '@/assets/icons/ui/brain.png'
import check from '@/assets/icons/ui/check.png'
import clock from '@/assets/icons/ui/clock.png'
import close from '@/assets/icons/ui/close.png'
import cookie from '@/assets/icons/ui/cookie.png'
import crown from '@/assets/icons/ui/crown.png'
import dice from '@/assets/icons/ui/dice.png'
import doorExit from '@/assets/icons/ui/door-exit.png'
import eye from '@/assets/icons/ui/eye.png'
import eyeOff from '@/assets/icons/ui/eye-off.png'
import flame from '@/assets/icons/ui/flame.png'
import gavel from '@/assets/icons/ui/gavel.png'
import gear from '@/assets/icons/ui/gear.png'
import gem from '@/assets/icons/ui/gem.png'
import help from '@/assets/icons/ui/help.png'
import home from '@/assets/icons/ui/home.png'
import infinity from '@/assets/icons/ui/infinity.png'
import info from '@/assets/icons/ui/info.png'
import layers from '@/assets/icons/ui/layers.png'
import loader from '@/assets/icons/ui/loader.png'
import lock from '@/assets/icons/ui/lock.png'
import medal from '@/assets/icons/ui/medal.png'
import megaphone from '@/assets/icons/ui/megaphone.png'
import minus from '@/assets/icons/ui/minus.png'
import moon from '@/assets/icons/ui/moon.png'
import party from '@/assets/icons/ui/party.png'
import pencil from '@/assets/icons/ui/pencil.png'
import play from '@/assets/icons/ui/play.png'
import plus from '@/assets/icons/ui/plus.png'
import receipt from '@/assets/icons/ui/receipt.png'
import restart from '@/assets/icons/ui/restart.png'
import scale from '@/assets/icons/ui/scale.png'
import scroll from '@/assets/icons/ui/scroll.png'
import share from '@/assets/icons/ui/share.png'
import shield from '@/assets/icons/ui/shield.png'
import sliders from '@/assets/icons/ui/sliders.png'
import sparkle from '@/assets/icons/ui/sparkle.png'
import stopwatch from '@/assets/icons/ui/stopwatch.png'
import suitClub from '@/assets/icons/ui/suit-club.png'
import suitDiamond from '@/assets/icons/ui/suit-diamond.png'
import suitHeart from '@/assets/icons/ui/suit-heart.png'
import suitSpade from '@/assets/icons/ui/suit-spade.png'
import sun from '@/assets/icons/ui/sun.png'
import sword from '@/assets/icons/ui/sword.png'
import thumbsDown from '@/assets/icons/ui/thumbs-down.png'
import thumbsUp from '@/assets/icons/ui/thumbs-up.png'
import trash from '@/assets/icons/ui/trash.png'
import userPlus from '@/assets/icons/ui/user-plus.png'
import users from '@/assets/icons/ui/users.png'
import wheel from '@/assets/icons/ui/wheel.png'
import wifiOff from '@/assets/icons/ui/wifi-off.png'

export const ICON_URLS = {
  arrowLeft,
  arrowRight,
  book,
  brain,
  check,
  clock,
  close,
  cookie,
  crown,
  dice,
  doorExit,
  eye,
  eyeOff,
  flame,
  gavel,
  gear,
  gem,
  help,
  home,
  infinity,
  info,
  layers,
  loader,
  lock,
  medal,
  megaphone,
  minus,
  moon,
  party,
  pencil,
  play,
  plus,
  receipt,
  restart,
  scale,
  scroll,
  share,
  shield,
  sliders,
  sparkle,
  stopwatch,
  suitClub,
  suitDiamond,
  suitHeart,
  suitSpade,
  sun,
  sword,
  thumbsDown,
  thumbsUp,
  trash,
  userPlus,
  users,
  wheel,
  wifiOff,
} as const

export type IconName = keyof typeof ICON_URLS
