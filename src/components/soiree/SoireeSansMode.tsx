import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

/**
 * Ce que voit une tablee pour qui l'enchainement n'a aucun mode a proposer.
 *
 * Le cas existe reellement : a une seule personne, aucun des treize modes n'est
 * jouable. Sans cet ecran, appuyer sur « Lance la soiree » ne produisait rien de
 * visible - l'enchainement restait actif, le sequenceur repondait « aucun mode
 * eligible », et le hub se reaffichait a l'identique. Un bouton qui ne fait rien
 * est lu comme une panne, et c'est nous qui l'aurions fabriquee.
 *
 * L'ecran dit donc ce qui manque, et rend la main au choix manuel plutot que de
 * laisser la tablee devant un bouton mort. Exigence T016.
 */
interface Props {
  /** Nombre de joueurs a la tablee, pour dire ce qui manque plutot que « erreur ». */
  effectif: number
  /** Ajouter des joueurs, la seule action qui debloque vraiment la situation. */
  onAjouterJoueurs: () => void
  /** Repasser en choix manuel, sans perdre la soiree. */
  onChoisirSoiMeme: () => void
}

export function SoireeSansMode({ effectif, onAjouterJoueurs, onChoisirSoiMeme }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="min-h-dvh flex flex-col justify-center gap-8 px-6 py-10 bg-surface"
      role="status"
    >
      <div className="flex flex-col gap-4 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
          On ne peut pas enchaîner
        </span>

        <h1 className="font-display uppercase leading-[0.95] text-ink text-[clamp(2rem,10vw,3.25rem)]">
          Il manque du monde
        </h1>

        <p className="text-ink/75 text-lg max-w-[24rem] mx-auto text-balance">
          {effectif <= 1
            ? "Les jeux de Bacchana se jouent à plusieurs. Ajoute au moins un autre joueur et l'enchaînement repart."
            : 'Aucun mode ne convient à cette tablée pour le moment. Ajoutez des joueurs, ou choisissez vous-mêmes.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="xl" className="w-full" onClick={onAjouterJoueurs}>
          Ajouter des joueurs
        </Button>
        <Button variant="ghost" className="w-full" onClick={onChoisirSoiMeme}>
          Choisir nous-mêmes
        </Button>
      </div>
    </motion.div>
  )
}
