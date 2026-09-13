/**
 * Le lien de reprise d'un achat web.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Bacchana se paie une fois, à vie, et sans compte. C'est un parti pris, mais il crée un
 * trou : un achat web est attaché à l'identifiant anonyme du navigateur, et un vidage de
 * cache ou un nouveau téléphone détruit ce que le joueur a payé. Le bouton dont le seul
 * rôle est de réparer ça ne le peut pas, parce que le SDK Web n'a pas de restauration
 * entre appareils.
 *
 * Le lien de reprise est le seul mécanisme officiel qui recolle quelque chose : rendu par
 * RevenueCat à l'achat, il rattache l'achat web à l'application mobile. Il couvre donc le
 * trajet qui compte pour Bacchana - on achète sur le site, on joue dans l'application.
 *
 * CE QU'IL NE COUVRE PAS, et qu'il ne faut pas laisser croire : il ne restaure rien dans
 * un autre NAVIGATEUR. Web vers un autre navigateur reste sans solution tant qu'aucun
 * identifiant n'est détenu de notre côté.
 *
 * DURÉE DE VIE : la documentation des liens de reprise annonce 60 minutes. On garde
 * quand même le lien au-delà, sans jamais promettre qu'il marchera : un lien périmé
 * renvoie un message clair du côté de l'application, alors qu'un lien effacé ne laisse
 * rien du tout. Retirer une porte ne remplace pas une porte qui grince.
 */

const CLE = 'bacchana-lien-de-reprise'

export interface LienDeReprise {
  url: string
  /** Horodatage de l'achat, en millisecondes. Sert à dire l'âge du lien, jamais à le bloquer. */
  emisLe: number
}

/** Durée annoncée par RevenueCat. Sert à AVERTIR, jamais à masquer le lien. */
export const DUREE_ANNONCEE_MS = 60 * 60 * 1000

/** Écrit le lien rendu par l'achat. Silencieux si le stockage est indisponible. */
export function enregistrerLienDeReprise(url: string, emisLe: number = Date.now()): void {
  try {
    window.localStorage.setItem(CLE, JSON.stringify({ url, emisLe } satisfies LienDeReprise))
  } catch {
    // Navigation privée, stockage plein : l'achat reste valide sur cet appareil, seule la
    // reprise sur mobile est perdue. Jamais de plantage pour ça.
  }
}

/**
 * Relit le lien. Rend null quand il n'y en a pas, ou quand ce qui est stocké n'a pas la
 * forme attendue - une valeur trafiquée à la main se traite comme une absence, jamais
 * comme une donnée.
 */
export function lireLienDeReprise(): LienDeReprise | null {
  try {
    const brut = window.localStorage.getItem(CLE)
    if (!brut) return null
    const valeur: unknown = JSON.parse(brut)
    if (typeof valeur !== 'object' || valeur === null) return null
    const { url, emisLe } = valeur as Partial<LienDeReprise>
    if (typeof url !== 'string' || url.length === 0) return null
    if (typeof emisLe !== 'number' || !Number.isFinite(emisLe)) return null
    return { url, emisLe }
  } catch {
    return null
  }
}

/**
 * Vrai quand le lien a dépassé la durée annoncée. L'appel reste possible : c'est un
 * avertissement à afficher, pas une interdiction.
 */
export function lienProbablementPerime(lien: LienDeReprise, maintenant: number = Date.now()): boolean {
  return maintenant - lien.emisLe > DUREE_ANNONCEE_MS
}

/** Efface le lien. Réservé à une réinitialisation explicite demandée par le joueur. */
export function oublierLienDeReprise(): void {
  try {
    window.localStorage.removeItem(CLE)
  } catch {
    // Rien à faire : un lien qu'on ne peut pas effacer ne donne accès à rien de plus que
    // l'achat qu'il représente déjà sur cet appareil.
  }
}
