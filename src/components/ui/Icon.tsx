import type { ComponentType } from 'react'
import {
  ArrowDoorOut,
  ArrowLeft,
  ArrowRight,
  Book,
  Bullhorn,
  Check,
  CheckSquare,
  Clock,
  Confetti,
  Cookie,
  Crown,
  Edit,
  Eye,
  EyeSlash,
  Fire,
  Gauge,
  Gear,
  Hand,
  Heart,
  HelpCircle,
  Home,
  Infinite,
  InfoCircle,
  Judge,
  Layers,
  Loader,
  Lock,
  MaskHappy,
  Medal,
  Minus,
  Moon,
  Pen,
  People,
  Play,
  Plus,
  Receipt,
  RotateLeft,
  Share3,
  Shield,
  Sliders,
  Sparkle,
  Star,
  Stopwatch,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserAdd,
  WifiOff,
  X,
  type IconProps as ReiconProps,
} from 'reicon-react'
import { cn } from '@/utils'
import {
  Brain,
  ChatSlash,
  Club,
  Dice,
  Diamond,
  Gem,
  HandTap,
  Pinwheel,
  Scales,
  Spade,
  Sword,
} from './custom-icons'
import type { IconName } from './icon-names'

export type { IconName }

export interface IconProps extends Omit<ReiconProps, 'weight' | 'color'> {
  /** Nom d'intention, pas de dessin : `quitter`, pas `porte`. Voir icon-names.ts. */
  name: IconName
  /** Taille via les classes Tailwind habituelles (`w-5 h-5`). */
  className?: string
}

type Glyphe = ComponentType<ReiconProps>

/**
 * nom d'intention -> dessin Reicon (reicon-react, MIT), ou glyphe maison de
 * `custom-icons.tsx` quand Reicon n'a pas d'equivalent honnete.
 *
 * Les noms sont des INTENTIONS, pas des dessins : c'est ce qui a permis de
 * changer quatre fois de jeu d'icones sans toucher un seul des
 * deux cents appels `<Icon name="..." />`. Le dessin se controle a l'oeil, pas
 * par une garde : `check_icons.mjs` ne verifie que la completude de la table.
 *
 * Les choix qui ne vont pas de soi :
 *   - `aide` : `HelpCircle`, absent de la table de correspondance commune.
 *   - `marteau-juge` : `Judge`. `balance` n'a PAS repris `Judge` (le meme
 *     marteau se lirait deux fois, notamment sur l'ecran du Tribunal) : glyphe
 *     maison.
 *   - `pique`, `trefle`, `carreau`, `gemme`, `des`, `epee`, `roue`, `cerveau`,
 *     `chut`, `appui`, `balance` : glyphes maison, Reicon n'a rien d'approchant.
 *     `gemme` (la dame au joyau) reste distincte de `carreau` (enseigne).
 */
const GLYPHES: Record<IconName, Glyphe> = {
  accueil: Home,
  aide: HelpCircle,
  'ajouter-joueur': UserAdd,
  appui: HandTap,
  balance: Scales,
  bouclier: Shield,
  cadenas: Lock,
  cadran: Gauge,
  carreau: Diamond,
  cerveau: Brain,
  chargement: Loader,
  chronometre: Stopwatch,
  chut: ChatSlash,
  coeur: Heart,
  cookie: Cookie,
  couronne: Crown,
  curseurs: Sliders,
  des: Dice,
  ecrire: Edit,
  editer: Pen,
  epee: Sword,
  etincelles: Sparkle,
  etoile: Star,
  fermer: X,
  fete: Confetti,
  flamme: Fire,
  gemme: Gem,
  horloge: Clock,
  'hors-ligne': WifiOff,
  infini: Infinite,
  info: InfoCircle,
  jouer: Play,
  joueurs: People,
  livre: Book,
  lune: Moon,
  'main-levee': Hand,
  'marteau-juge': Judge,
  masque: MaskHappy,
  medaille: Medal,
  megaphone: Bullhorn,
  moins: Minus,
  oeil: Eye,
  'oeil-barre': EyeSlash,
  paquets: Layers,
  partager: Share3,
  pique: Spade,
  plus: Plus,
  'pouce-bas': ThumbsDown,
  'pouce-haut': ThumbsUp,
  quitter: ArrowDoorOut,
  recommencer: RotateLeft,
  reglages: Gear,
  retour: ArrowLeft,
  roue: Pinwheel,
  soleil: Sun,
  suivant: ArrowRight,
  supprimer: Trash2,
  ticket: Receipt,
  trefle: Club,
  valider: Check,
  vote: CheckSquare,
}

/**
 * Icone Reicon en poids `Filled`, la base du depot (comme le poids
 * `fill` de l'ancien jeu). Rendue en SVG inline : elle herite de `currentColor`, donc
 * de `text-neon`, `text-tile-ink` et du theme clair/sombre. Aucun fichier a
 * servir, aucun CDN, l'app reste entiere hors ligne.
 *
 * Toujours decorative : le sens est porte par le texte ou le `aria-label` du
 * controle parent. D'ou `aria-hidden` par defaut, surchargeable.
 */
export function Icon({ name, className, ...rest }: IconProps) {
  const Glyphe = GLYPHES[name]
  return (
    <Glyphe
      weight="Filled"
      aria-hidden="true"
      {...rest}
      className={cn('inline-block shrink-0 w-5 h-5 align-middle', className)}
    />
  )
}
