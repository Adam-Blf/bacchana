import { cn } from '@/utils'
import type { IconName } from './icon-names'

export type { IconName }

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Nom d'intention, pas de dessin : `quitter`, pas `porte`. Voir icon-names.ts. */
  name: IconName
  /** Taille via les classes Tailwind habituelles (`w-5 h-5`). */
  className?: string
}

/**
 * Icône Phosphor SVG (poids `fill`) rendue en **masque CSS**.
 *
 * Pourquoi un masque et pas un `<img>` : le dessin est un aplat monochrome,
 * `<img>` l'afficherait de sa propre couleur sur fond crème comme sur fond
 * encre, donc invisible dans l'un des deux thèmes. Le masque ne garde que la
 * forme et la peint en `currentColor`, exactement comme le ferait un SVG
 * inline. L'icône hérite donc de `text-neon`, `text-tile-ink`, du thème
 * clair/sombre, de tout.
 *
 * Le poids `fill` n'est pas un goût, c'est une CONTRAINTE du masque : un poids
 * à contour (`thin`, `light`, `regular`, `bold`) est un tracé évidé, et le
 * masque n'en garderait que le liseré. Seule une forme pleine se peint
 * entièrement. Voir `scripts/outils/vendor_phosphor.mjs`.
 *
 * Les fichiers vivent dans `public/icons/`, servis en chemin relatif : aucun
 * CDN, l'app reste entièrement fonctionnelle hors ligne.
 *
 * Toujours décoratif : le sens est porté par le texte ou le `aria-label` du
 * contrôle parent. D'où `aria-hidden` par défaut, surchargeable.
 */
export function Icon({ name, className, style, ...rest }: IconProps) {
  const url = `url(/icons/${name}.svg)`
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cn('inline-block shrink-0 w-5 h-5 align-middle', className)}
      style={{
        backgroundColor: 'currentColor',
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
    />
  )
}
