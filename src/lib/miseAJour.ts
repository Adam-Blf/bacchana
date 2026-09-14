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
 *   - quand une version est prete, on l'applique quand l'application est
 *     CACHEE et qu'aucune partie ne tourne, et on ATTEND sinon ;
 *   - on reessaie a chaque changement d'ecran et a chaque fois que
 *     l'application part en arriere-plan.
 *
 * « ECRAN DE REPOS » NE VOULAIT PAS DIRE « PERSONNE NE REGARDE », et c'est la
 * correction du 2026-09-14. La regle d'origine rechargeait des que l'ecran
 * courant etait l'accueil, le hub ou les regles - en tenant pour acquis que
 * personne n'y perdait rien. C'est vrai d'une PARTIE, ce n'est pas vrai d'un
 * REGARD : le hub est precisement l'ecran ou une tablee s'attarde a choisir un
 * jeu. Un rechargement y vide la page et la repeint, et c'est un clignotement
 * sous les yeux de tout le monde.
 *
 * Pire, le declencheur le plus frequent est le RETOUR dans l'application : on
 * interrogeait le serveur au reveil, puis on appliquait dans la foulee. Le
 * joueur reprend son telephone, et l'application clignote au moment precis ou
 * il la regarde. Sur un appareil qui met en arriere-plan sans arret, cela se
 * repete.
 *
 * La condition est donc double : ecran de repos ET application cachee. Un
 * rechargement qui arrive pendant que l'ecran est eteint n'est vu par
 * personne, par construction - il n'y a plus a raisonner sur ce que le joueur
 * est « en train » de faire. Le moment ou il range son telephone est le bon
 * moment, et c'est desormais un declencheur a part entiere.
 *
 * CE QUE CETTE CORRECTION NE PROUVE PAS. Elle n'etablit pas que ce
 * rechargement etait LE scintillement signale sur iPhone : il n'a pas pu etre
 * reproduit sur navigateur pilote, ou aucun nouveau service worker ne s'est
 * installe malgre un `sw.js` different servi sans cache. Recharger une page
 * qu'on regarde est un defaut par soi-meme, et c'est a ce titre que c'est
 * corrige.
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
 * Vrai quand l'application n'est pas a l'ecran.
 *
 * `document.visibilityState` vaut `'visible'` par defaut la ou il n'existe pas
 * (un test, un rendu hors navigateur) : dans le doute, on ne recharge PAS.
 */
function applicationCachee(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden'
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
    // Les deux conditions, et pas une seule : aucune partie en cours ET
    // personne devant l'ecran. Voir l'en-tete du module.
    if (!ecranDeRepos()) return
    if (!applicationCachee()) return
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
      const auChangementDeVisibilite = () => {
        if (document.visibilityState === 'visible') {
          // Le retour est le meilleur moment pour CHERCHER : le joueur vient de
          // rouvrir, il ne joue pas encore. Ce n'est plus le moment d'appliquer,
          // il regarde l'ecran.
          chercher()
          return
        }
        // Il vient de ranger son telephone. Si une version attend, c'est
        // maintenant, et personne ne le verra.
        appliquerSiPossible()
      }
      document.addEventListener('visibilitychange', auChangementDeVisibilite)
      aArreter.push(() => document.removeEventListener('visibilitychange', auChangementDeVisibilite))

      // Retour du reseau : une PWA passe beaucoup de temps hors ligne, et c'est
      // souvent la seule occasion de la journee d'atteindre le serveur.
      window.addEventListener('online', chercher)
      aArreter.push(() => window.removeEventListener('online', chercher))
    },
  })

  // Une version peut devenir prete pendant une partie. On reessaie a chaque
  // changement d'ecran : la partie se termine, l'ecran revient au hub, et la
  // mise a jour part au prochain passage en arriere-plan.
  const desabonner = useAppStore.subscribe(appliquerSiPossible)
  aArreter.push(desabonner)

  return () => aArreter.forEach((f) => f())
}
