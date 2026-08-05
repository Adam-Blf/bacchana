import type { CSSProperties, HTMLAttributes } from 'react'
import { cn } from '@/utils'

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** URL du PNG vendorise (voir registry.ts). */
  src: string
}

/**
 * Icone Icons8 Hatch rendue en masque CSS : le PNG monochrome sert de pochoir et
 * `background-color: currentColor` fait la couleur. Une seule source d'asset suit
 * donc le texte environnant dans les deux themes (clair/sombre), exactement comme
 * le faisaient les SVG `stroke="currentColor"`, sans dependre d'un format SVG.
 *
 * La taille vient des classes utilitaires (`w-4 h-4`...), comme avant : le masque
 * est en `contain` + centre, le glyphe occupe toute la boite.
 */
export function Icon({ src, className, style, ...rest }: IconProps) {
  const maskStyle: CSSProperties = {
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    ...style,
  }
  return (
    <span
      {...rest}
      className={cn('inline-block shrink-0 select-none', className)}
      style={maskStyle}
    />
  )
}
