import { cn } from '@/utils'

/**
 * Sceau de cire de La Tournée - remplace le cadenas sur tout ce qui est
 * premium. Cire rouge au bord irrégulier, monogramme T (Tournée, cf lexique
 * "une tournée" = une manche) estampé en creux, reflet discret. SVG inline,
 * aucune dépendance, couleurs fixes : la cire est un objet physique,
 * identique dans les deux thèmes.
 */
interface WaxSealProps {
  className?: string
  /** Taille rendue (carrée) en pixels CSS. */
  size?: number
}

export function WaxSeal({ className, size = 28 }: WaxSealProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn('drop-shadow-[1px_2px_0_rgba(0,0,0,0.25)]', className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* galette de cire, bord volontairement irrégulier */}
      <path
        d="M32 3c5-2 10 1 14 3 4 2 10 1 13 5 3 4 0 9 1 14 1 5 4 10 1 14-2 4-8 4-11 7-4 3-5 9-10 11-5 2-9-2-14-2s-10 3-14 0c-4-3-3-9-6-13C3 38 0 34 1 29c1-5 6-7 8-11 2-4 1-10 5-13 4-3 9-1 13-2h5Z"
        fill="#A3232B"
      />
      <path
        d="M32 8c4-1.5 8 .8 11 2.4 3.2 1.6 8 .8 10.4 4 2.4 3.2 0 7.2.8 11.2.8 4 3.2 8 .8 11.2-1.6 3.2-6.4 3.2-8.8 5.6-3.2 2.4-4 7.2-8 8.8-4 1.6-7.2-1.6-11.2-1.6s-8 2.4-11.2 0c-3.2-2.4-2.4-7.2-4.8-10.4-2.4-3.2-4.8-6.4-4-10.4.8-4 4.8-5.6 6.4-8.8 1.6-3.2.8-8 4-10.4 3.2-2.4 7.2-.8 10.4-1.6h4.2Z"
        fill="#8E1F26"
      />
      {/* anneau du cachet */}
      <circle cx="32" cy="32" r="17" fill="none" stroke="#701a20" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="14" fill="none" stroke="#c04d53" strokeWidth="1" opacity="0.6" />
      {/* monogramme T estampé */}
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="20"
        fill="#5e151a"
      >
        T
      </text>
      <text
        x="31.2"
        y="38.2"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="20"
        fill="#c9575e"
        opacity="0.55"
      >
        T
      </text>
      {/* reflet */}
      <ellipse cx="24" cy="18" rx="9" ry="4" fill="#ffffff" opacity="0.14" transform="rotate(-24 24 18)" />
    </svg>
  )
}
