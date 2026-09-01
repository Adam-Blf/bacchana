import { motion, useReducedMotion } from 'framer-motion'

/**
 * L'écran d'attente de Bacchana.
 *
 * **Ce qu'il remplace, et pourquoi ça comptait.** L'attente était une ligne de
 * texte « chargement… » en `text-ink-muted`, centrée sur le fond. Sur l'aplat
 * pourpre, cette encre atteint à peine 2:1 : à l'usage, l'écran paraissait
 * VIDE. Or les treize écrans de jeu sont chargés à la demande, donc ce trou
 * s'ouvrait à chaque lancement de partie, au moment précis où la tablée regarde
 * le téléphone. Un écran qui s'ouvre vide se lit comme « il n'y a rien », pas
 * comme « ça arrive ».
 *
 * **Pourquoi cette forme.** La marque n'a ni dégradé, ni flou, ni rotation
 * infinie : un sablier générique jurerait. L'attente emprunte donc à l'objet
 * récurrent de la marque, l'addition : des points de conduite qui s'impriment
 * l'un après l'autre, comme une imprimante à ticket qui sort la note. C'est le
 * seul mouvement qui dise « la maison prépare quelque chose » sans emprunter le
 * vocabulaire d'une autre application.
 *
 * **Mouvement réduit.** Sous `prefers-reduced-motion`, les points sont posés
 * d'emblée et rien ne bouge. La ligne reste lisible, ce qui est le seul rôle
 * indispensable de cet écran.
 */
export function Chargement({ libelle = 'ON PRÉPARE LA TABLE' }: { libelle?: string }) {
  const sansMouvement = useReducedMotion()
  const points = [0, 1, 2, 3, 4]

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-bg px-8"
      role="status"
      aria-live="polite"
    >
      {/* L'éclat du logo, repris tel quel. Il respire, il ne tourne pas : une
          étoile à quatre branches cesse d'être lue comme telle dès qu'on
          l'incline. */}
      <motion.svg
        viewBox="178 68 156 156"
        className="w-14 h-14"
        aria-hidden="true"
        animate={sansMouvement ? undefined : { scale: [0.86, 1.06, 0.86] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M256 74 L272 130 L328 146 L272 162 L256 218 L240 162 L184 146 L240 130 Z"
          className="fill-aplat-1 stroke-ink"
          strokeWidth={12}
          strokeLinejoin="round"
        />
      </motion.svg>

      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-secondary text-center">
        {libelle}
      </p>

      {/* Les points s'impriment de gauche à droite, comme une note qui sort. */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {points.map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-secondary"
            initial={sansMouvement ? { opacity: 1 } : { opacity: 0.15 }}
            animate={sansMouvement ? undefined : { opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.13,
            }}
          />
        ))}
      </div>
    </div>
  )
}
