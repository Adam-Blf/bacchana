import { motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAgeGateStore } from '@/stores'

/**
 * Porte d'âge, premier écran absolu de l'application.
 *
 * Passe AVANT l'onboarding, et n'est pas contournable : ni bouton « passer », ni
 * fermeture, ni retour. C'est la différence entre une restriction affichée et une
 * restriction opposable, et c'est tout l'intérêt de l'écran (voir `ageGateStore`).
 *
 * Le refus n'est pas une impasse muette : il affiche le motif et le numéro
 * d'Alcool Info Service. Renvoyer un mineur sur un écran vide serait une réponse
 * de juriste, pas de produit.
 */
export function AgeGateScreen() {
  const reponse = useAgeGateStore((s) => s.reponse)
  const declarer = useAgeGateStore((s) => s.declarer)

  // Le refus est persistant : relancer l'application ne rouvre pas la question.
  if (reponse === 'mineur') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe bg-bg">
        <div className="w-full max-w-md rounded-card border-2 border-tile-ink bg-pop-blue p-8 text-center text-tile-ink shadow-tile-lg">
          <Icon name="balance" className="w-12 h-12 mx-auto mb-5 text-tile-ink" aria-hidden="true" />
          <h1 className="font-display text-2xl uppercase tracking-tight leading-tight">
            Rendez-vous à 18 ans
          </h1>
          <p className="font-sans text-tile-ink/80 mt-4 leading-relaxed">
            Bacchana est réservé aux personnes majeures. On garde ta place au
            comptoir.
          </p>
        </div>
        <p className="mt-6 max-w-md text-center font-sans text-caption text-ink-secondary">
          Besoin d&apos;en parler ? Alcool Info Service, 0 980 980 930, appel non
          surtaxé et anonyme.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe pb-safe bg-bg">
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          className="w-full rounded-card border-2 border-tile-ink bg-pop-yellow p-8 text-center text-tile-ink shadow-tile-lg"
        >
          <Icon name="balance" className="w-12 h-12 mx-auto mb-5 text-tile-ink" aria-hidden="true" />
          <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-tight leading-tight">
            Tu as 18 ans ou plus ?
          </h1>
          <p className="font-sans text-tile-ink/80 mt-4 leading-relaxed">
            Bacchana est un jeu de soirée réservé aux majeurs. Certains gages
            impliquent de boire, et rien ne t&apos;y oblige jamais.
          </p>
        </motion.div>

        <p className="mt-6 text-center font-sans text-caption text-ink-secondary">
          L&apos;abus d&apos;alcool est dangereux pour la santé, à consommer avec
          modération.
        </p>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4 space-y-3">
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          onClick={() => declarer('majeur')}
        >
          Oui, j&apos;ai 18 ans ou plus
        </Button>
        {/* Le refus est un vrai bouton, de même taille de cible, pas un lien
            minuscule : un choix rendu difficile à exprimer n'est pas un choix. */}
        <Button
          variant="ghost"
          size="xl"
          className="w-full"
          onClick={() => declarer('mineur')}
        >
          Non, j&apos;ai moins de 18 ans
        </Button>
      </footer>
    </div>
  )
}
