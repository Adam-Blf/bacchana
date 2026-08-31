import { AnimatePresence, motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAvisStore } from '@/stores/avisStore'
import { lienAvis } from '@/lib/avis'

/**
 * La demande de note, posee une fois la soiree finie.
 *
 * CE QUE CET ECRAN NE FAIT PAS, VOLONTAIREMENT
 * --------------------------------------------
 * Il ne demande pas d'abord si la soiree s'est bien passee. Ce schema, tres repandu,
 * sert a n'envoyer vers le store que ceux qui ont aime et a detourner les autres vers
 * un formulaire prive. C'est du filtrage d'avis, interdit par Google Play comme par
 * Apple, et malhonnete envers ceux qui liront la note. Il n'y a donc ici qu'une seule
 * question et un seul chemin, le meme pour une tablee ravie et pour une tablee decue.
 *
 * Il ne promet rien en echange. Offrir quoi que ce soit contre un avis - contenu,
 * premium, bonus - est interdit des deux cotes.
 *
 * Il ne bloque pas. « Non merci » ferme definitivement le sujet, et c'est le bouton
 * qui a le meme poids visuel que l'autre.
 *
 * L'INSTANT
 * ---------
 * Jamais pendant une partie. La question arrive quand la soiree se termine, au moment
 * ou le telephone se repose. Les conditions d'eligibilite (anciennete, plafond, delai)
 * vivent dans `avisStore`, pas ici : cet ecran affiche, il ne decide pas.
 */
interface Props {
  open: boolean
  /** Ferme sans clore : la question pourra revenir apres le delai. */
  onFermer: () => void
}

export function DemandeAvis({ open, onFermer }: Props) {
  const clore = useAvisStore((s) => s.clore)
  const lien = lienAvis()

  // Sans fiche store configuree, il n'y a rien a noter : on n'affiche pas une
  // question dont la reponse positive ne menerait nulle part.
  if (!lien) return null

  const noter = () => {
    // Clos avant l'ouverture : quelqu'un qui part noter ne doit plus jamais revoir la
    // question, meme si l'onglet du store ne s'ouvre pas.
    clore()
    window.open(lien, '_blank', 'noopener,noreferrer')
    onFermer()
  }

  const refuser = () => {
    clore()
    onFermer()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-black/70 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demande-avis-titre"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-sm rounded-card bg-surface-elevated border border-border-strong p-6"
          >
            {/* `medaille` et non une etoile : l'etoile serait le symbole juste, mais
                le catalogue vendorise n'en contient pas et le plan SVG Icons8 refuse
                actuellement les telechargements. Dessiner une etoile a la main
                sortirait du seul canal d'icones autorise. A remplacer par `etoile`
                des que la cle est disponible - ajouter la ligne dans
                scripts/vendor_icons8.py et relancer le script. */}
            <div className="w-12 h-12 rounded-full bg-aplat-1 border border-tile-ink flex items-center justify-center mb-4">
              <Icon name="medaille" className="w-5 h-5 text-tile-ink" aria-hidden="true" />
            </div>

            <h2
              id="demande-avis-titre"
              className="font-display text-2xl uppercase tracking-tight text-ink leading-tight"
            >
              Un mot sur Bacchana ?
            </h2>

            <p className="font-sans text-sm text-ink-secondary mt-3 leading-relaxed">
              Si la soirée vous a plu, une note aide vraiment. Si elle vous a déçu, dites-le
              aussi : c&apos;est le même lien, et c&apos;est plus utile.
            </p>

            <div className="flex flex-col gap-2 mt-6">
              <Button variant="primary" className="w-full" onClick={noter}>
                Laisser une note
              </Button>
              {/* Meme largeur, meme hauteur de cible : refuser ne doit pas etre le
                  choix qu'on cache. */}
              <Button variant="ghost" className="w-full" onClick={refuser}>
                Non merci
              </Button>
            </div>

            <p className="font-sans text-xs text-ink-muted text-center mt-4">
              On ne vous le redemandera pas.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
