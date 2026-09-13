/**
 * L'etat local minimal pour qu'un navigateur pilote atteigne l'application.
 *
 * Ecrit une fois, importe par tous les scripts qui ouvrent l'app : la porte
 * d'age, le bandeau de consentement et l'intro sont des points de passage
 * OBLIGATOIRES du produit, donc autant d'ecrans devant lesquels un script
 * s'arrete sans rien dire d'utile - il rapporte « bouton introuvable », jamais
 * « il y a une porte devant toi ».
 *
 * Chaque script portait sa propre copie de ces cles. Ajouter la porte d'age le
 * 2026-09-13 aurait demande de les retrouver une par une, et celle qu'on oublie
 * ne se signale qu'au prochain audit, plusieurs semaines plus tard.
 *
 * Les formes suivent le middleware `persist` de zustand ({ state, version }) et
 * doivent bouger avec lui.
 */

/** Declare la tablee majeure, le consentement tranche, et l'intro deja vue. */
export function amorcerApp(page, { theme = 'light', consentement = true } = {}) {
  return page.addInitScript(
    ({ theme, consentement }) => {
      // `about:blank` refuse localStorage, et le script d'initialisation s'y
      // execute aussi : sans ce filet, l'exception remonte comme une erreur de
      // console et fait echouer des audits qui ne mesurent pas ca.
      try {
        localStorage.setItem(
          'bacchana-age-gate',
          JSON.stringify({ state: { reponse: 'majeur', declareLe: Date.now() }, version: 0 })
        )
        localStorage.setItem(
          'bacchana-theme',
          JSON.stringify({ state: { preference: theme }, version: 0 })
        )
        localStorage.setItem(
          'bacchana-onboarding',
          JSON.stringify({ state: { hasSeenIntro: true }, version: 0 })
        )
        if (consentement) {
          localStorage.setItem(
            'bacchana-consent',
            JSON.stringify({
              state: {
                consent: { necessary: true, analytics: false },
                consentVersion: 1,
                decidedAt: Date.now(),
                isPanelOpen: false,
              },
              version: 0,
            })
          )
        }
      } catch {
        /* document sans stockage */
      }
    },
    { theme, consentement }
  )
}

/** La seule cle de la porte d'age, pour un script qui n'amorce que celle-la. */
export const CLE_PORTE_AGE = 'bacchana-age-gate'
