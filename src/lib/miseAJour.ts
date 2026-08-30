import { registerSW } from 'virtual:pwa-register'
import { useAppStore } from '@/stores'

/**
 * Mise a jour de la PWA quand le site change.
 *
 * LE DEFAUT, releve le 2026-08-31. `vite-plugin-pwa` etait bien configure en
 * `autoUpdate`, et le service worker genere appelle bien `skipWaiting` et
 * `clientsClaim`. Mais l'enregistrement injecte tenait en une ligne :
 *
 *     navigator.serviceWorker.register('/sw.js', { scope: '/' })
 *
 * Il s'execute une fois, au chargement, et ne redemande plus jamais rien. Or
 * une PWA installee sur un telephone n'est pas une page qu'on recharge : elle
 * est ouverte, mise en arriere-plan, reprise trois jours plus tard. Sans appel
 * explicite a `update()`, le navigateur ne va rechercher `sw.js` qu'a une
 * navigation, et il plafonne meme ce controle a une fois par 24 h. Un joueur
 * pouvait donc rester des semaines sur une version que le site avait remplacee,
 * sans que rien ne soit casse nulle part - c'est exactement le genre de panne
 * qui ne se voit pas.
 *
 * POURQUOI PAS `autoUpdate` TOUT COURT. `autoUpdate` recharge la page des que
 * le nouveau service worker prend la main. Sur un jeu de soiree, cela veut dire
 * une page qui se recharge pendant qu'une tablee de six attend la carte
 * suivante : la manche est perdue, et personne ne comprend pourquoi. Une mise a
 * jour silencieuse est un service ; une mise a jour qui coupe une partie est
 * une panne.
 *
 * LE COMPROMIS RETENU. On cherche souvent, on applique au bon moment :
 *
 *   - on interroge le serveur au retour dans l'application, au retour du
 *     reseau, et toutes les heures tant qu'elle reste ouverte ;
 *   - quand une version est prete, on l'applique TOUT DE SUITE si l'ecran est
 *     un ecran de repos, et on ATTEND sinon ;
 *   - des que le joueur revient a un ecran de repos, on applique.
 *
 * Le rechargement reste donc invisible : il arrive entre deux parties, jamais
 * au milieu d'une.
 */

/** Ecrans ou un rechargement ne coute rien : personne n'est en train de jouer. */
const ECRANS_DE_REPOS = new Set(['onboarding', 'welcome', 'hub', 'rules', 'mode-rules'])

/** Une heure. Assez rare pour ne rien couter, assez frequent pour qu'une
 *  correction publiee le matin soit en place le soir meme. */
const INTERVALLE_MS = 60 * 60 * 1000

function ecranDeRepos(): boolean {
  return ECRANS_DE_REPOS.has(useAppStore.getState().currentScreen)
}

/**
 * Branche la mise a jour. Rend une fonction d'arret, utile aux tests.
 *
 * Ne fait rien hors navigateur ni sans `serviceWorker` : l'application doit
 * demarrer identiquement dans un test, dans un rendu serveur, ou dans un
 * navigateur qui refuse les service workers.
 */
export function brancherMiseAJour(): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return () => {}

  let appliquer: ((rechargerMaintenant?: boolean) => Promise<void>) | null = null
  let enAttente = false
  const aArreter: Array<() => void> = []

  const appliquerSiPossible = () => {
    if (!enAttente || !appliquer) return
    if (!ecranDeRepos()) return
    enAttente = false
    // `true` demande au nouveau service worker de prendre la main, ce qui
    // declenche le rechargement. On ne l'appelle qu'ici.
    void appliquer(true)
  }

  appliquer = registerSW({
    immediate: true,

    onNeedRefresh() {
      enAttente = true
      appliquerSiPossible()
    },

    onRegisteredSW(_url, enregistrement) {
      if (!enregistrement) return

      const chercher = () => {
        // Hors ligne, `update()` rejette : c'est normal et sans consequence, la
        // prochaine occasion suffira. On ne veut surtout pas d'une promesse non
        // capturee qui remonte a Sentry a chaque tunnel de metro.
        void enregistrement.update().catch(() => {})
      }

      const minuterie = window.setInterval(chercher, INTERVALLE_MS)
      aArreter.push(() => window.clearInterval(minuterie))

      // Le retour dans l'application est le meilleur moment pour chercher : le
      // joueur vient de la rouvrir, il ne joue pas encore.
      const auRetour = () => {
        if (document.visibilityState === 'visible') {
          chercher()
          appliquerSiPossible()
        }
      }
      document.addEventListener('visibilitychange', auRetour)
      aArreter.push(() => document.removeEventListener('visibilitychange', auRetour))

      // Retour du reseau : une PWA passe beaucoup de temps hors ligne, et c'est
      // souvent la seule occasion de la journee d'atteindre le serveur.
      window.addEventListener('online', chercher)
      aArreter.push(() => window.removeEventListener('online', chercher))
    },
  })

  // Une version peut devenir prete pendant une partie. On reessaie a chaque
  // changement d'ecran plutot que d'attendre le prochain reveil : c'est ce qui
  // rend le rechargement invisible.
  const desabonner = useAppStore.subscribe(appliquerSiPossible)
  aArreter.push(desabonner)

  return () => aArreter.forEach((f) => f())
}
