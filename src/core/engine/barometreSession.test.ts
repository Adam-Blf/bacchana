import { describe, it, expect } from 'vitest'
import {
  AIGUILLE_DEPART,
  ECART_ACCEPTABLE,
  ECART_PLEIN_CENTRE,
  MARGE_BORD,
  PENALITE_AIGUILLEUR,
  PENALITE_DEVINEUR,
  commencerCadrage,
  commencerVisee,
  createBarometreSession,
  deplacerAiguille,
  getAiguilleur,
  getDevineurs,
  mancheSuivante,
  rendreLeTelephone,
  tirerCible,
  verdictDe,
  verrouillerVisee,
  type BarometreSessionState,
} from './barometreSession'
import type { AxeBarometre } from '@/content/barometre'
import type { Player } from '@/types'

const AXES: AxeBarometre[] = Array.from({ length: 6 }, (_, i) => ({
  id: `bm-${i}`,
  gauche: `Gauche ${i}`,
  droite: `Droite ${i}`,
}))

const PLAYERS: Player[] = [
  { id: 'a', name: 'Alex', active: true },
  { id: 'b', name: 'Sam', active: true },
  { id: 'c', name: 'Lou', active: true },
]

const rng = () => 0.5

/** Amène une session jusqu'à la visée, aiguille posée où on le demande. */
function viser(position: number, etat?: BarometreSessionState): BarometreSessionState {
  let session = etat ?? createBarometreSession(AXES, PLAYERS, rng)
  session = commencerCadrage(session)
  session = rendreLeTelephone(session)
  session = commencerVisee(session)
  return deplacerAiguille(session, position)
}

describe('createBarometreSession', () => {
  it('ouvre sur le passage du téléphone, avec un axe et une cible', () => {
    const session = createBarometreSession(AXES, PLAYERS, rng)
    expect(session.phase).toBe('passage')
    expect(session.manche?.axe.id).toBeDefined()
    expect(session.aiguille).toBe(AIGUILLE_DEPART)
    expect(session.ecart).toBeNull()
  })

  it('écarte les joueurs inactifs de la tablée', () => {
    const session = createBarometreSession(
      AXES,
      [...PLAYERS, { id: 'z', name: 'Parti', active: false }],
      rng,
    )
    expect(session.players.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('termine tout de suite si le paquet d\'axes est vide', () => {
    const session = createBarometreSession([], PLAYERS, rng)
    expect(session.phase).toBe('finished')
    expect(session.manche).toBeNull()
  })

  it('respecte la longueur de manche demandée', () => {
    const session = createBarometreSession(AXES, PLAYERS, rng, { longueur: 3 })
    // Trois axes tirés, dont un déjà en main : il en reste deux en file.
    expect(session.queue.length).toBe(2)
  })

  it('sert les axes inédits avant ceux déjà vus ce soir', () => {
    const dejaVus = new Set(['bm-0', 'bm-1', 'bm-2', 'bm-3', 'bm-4'])
    const session = createBarometreSession(AXES, PLAYERS, rng, { dejaVus })
    expect(session.manche?.axe.id).toBe('bm-5')
  })
})

describe('tirerCible', () => {
  it('ne tombe jamais dans les marges de bord', () => {
    for (let i = 0; i <= 100; i++) {
      const cible = tirerCible(() => i / 100)
      expect(cible).toBeGreaterThanOrEqual(MARGE_BORD)
      expect(cible).toBeLessThanOrEqual(100 - MARGE_BORD)
    }
  })
})

describe('enchaînement des phases', () => {
  it('passe du passage au verdict, une étape à la fois', () => {
    let session = createBarometreSession(AXES, PLAYERS, rng)
    session = commencerCadrage(session)
    expect(session.phase).toBe('cadrage')
    session = rendreLeTelephone(session)
    expect(session.phase).toBe('retour')
    session = commencerVisee(session)
    expect(session.phase).toBe('visee')
    session = verrouillerVisee(session)
    expect(session.phase).toBe('verdict')
  })

  it('ignore une transition prise hors de son tour', () => {
    const session = createBarometreSession(AXES, PLAYERS, rng)
    // La tablée ne peut pas viser avant que l'aiguilleur ait rendu le téléphone.
    expect(commencerVisee(session)).toBe(session)
    expect(deplacerAiguille(session, 80)).toBe(session)
    expect(verrouillerVisee(session)).toBe(session)
  })
})

describe('deplacerAiguille', () => {
  it('borne la position au cadran et arrondit', () => {
    expect(viser(140).aiguille).toBe(100)
    expect(viser(-30).aiguille).toBe(0)
    expect(viser(42.6).aiguille).toBe(43)
  })
})

describe('verdictDe', () => {
  it('nomme les trois issues aux bornes exactes', () => {
    expect(verdictDe(0)).toBe('plein-centre')
    expect(verdictDe(ECART_PLEIN_CENTRE)).toBe('plein-centre')
    expect(verdictDe(ECART_PLEIN_CENTRE + 1)).toBe('dans-le-mille-large')
    expect(verdictDe(ECART_ACCEPTABLE)).toBe('dans-le-mille-large')
    expect(verdictDe(ECART_ACCEPTABLE + 1)).toBe('a-cote')
  })
})

describe('verrouillerVisee', () => {
  it('mesure l\'écart entre l\'aiguille et la cible', () => {
    const session = viser(0)
    const verrouillee = verrouillerVisee(session)
    expect(verrouillee.ecart).toBe(session.manche!.cible)
  })

  it('ne pénalise personne quand le mot a porté', () => {
    const session = viser(createBarometreSession(AXES, PLAYERS, rng).manche!.cible)
    const verrouillee = verrouillerVisee(session)
    expect(verrouillee.ecart).toBe(0)
    expect(verrouillee.penaltyCounts).toEqual({})
  })

  it('ne fait payer que l\'aiguilleur quand la tablée s\'approche', () => {
    const base = createBarometreSession(AXES, PLAYERS, rng)
    const session = viser(base.manche!.cible + ECART_PLEIN_CENTRE + 1, base)
    const verrouillee = verrouillerVisee(session)
    const aiguilleur = getAiguilleur(verrouillee)!
    expect(verrouillee.penaltyCounts[aiguilleur.id]).toBe(PENALITE_AIGUILLEUR)
    for (const devineur of getDevineurs(verrouillee)) {
      expect(verrouillee.penaltyCounts[devineur.id]).toBeUndefined()
    }
  })

  it('fait payer toute la tablée quand personne ne s\'est compris', () => {
    const base = createBarometreSession(AXES, PLAYERS, rng)
    const session = viser(base.manche!.cible + ECART_ACCEPTABLE + 1, base)
    const verrouillee = verrouillerVisee(session)
    const aiguilleur = getAiguilleur(verrouillee)!
    expect(verrouillee.penaltyCounts[aiguilleur.id]).toBe(PENALITE_AIGUILLEUR)
    for (const devineur of getDevineurs(verrouillee)) {
      expect(verrouillee.penaltyCounts[devineur.id]).toBe(PENALITE_DEVINEUR)
    }
  })

  it('cumule les pénalités d\'une manche sur l\'autre', () => {
    const base = createBarometreSession(AXES, PLAYERS, rng)
    const premiere = verrouillerVisee(viser(0, base))
    const seconde = verrouillerVisee(viser(100, mancheSuivante(premiere, rng)))
    const total = Object.values(seconde.penaltyCounts).reduce((s, n) => s + n, 0)
    expect(total).toBeGreaterThan(Object.values(premiere.penaltyCounts).reduce((s, n) => s + n, 0))
  })
})

describe('mancheSuivante', () => {
  it('fait tourner le rôle d\'aiguilleur et remet l\'aiguille au milieu', () => {
    const premiere = verrouillerVisee(viser(0))
    const seconde = mancheSuivante(premiere, rng)
    expect(getAiguilleur(seconde)?.id).toBe('b')
    expect(seconde.aiguille).toBe(AIGUILLE_DEPART)
    expect(seconde.ecart).toBeNull()
    expect(seconde.phase).toBe('passage')
    expect(seconde.mancheNumero).toBe(2)
  })

  it('ne ressort jamais deux fois le même axe dans une manche', () => {
    let session = createBarometreSession(AXES, PLAYERS, rng)
    const servis: string[] = []
    while (session.phase !== 'finished') {
      servis.push(session.manche!.axe.id)
      session = mancheSuivante(verrouillerVisee(viser(50, session)), rng)
    }
    expect(new Set(servis).size).toBe(servis.length)
    expect(servis.length).toBe(AXES.length)
  })

  it('boucle le rôle d\'aiguilleur sur toute la tablée', () => {
    let session = createBarometreSession(AXES, PLAYERS, rng)
    const roles: string[] = []
    for (let i = 0; i < PLAYERS.length + 1; i++) {
      roles.push(getAiguilleur(session)!.id)
      session = mancheSuivante(verrouillerVisee(viser(50, session)), rng)
    }
    expect(roles).toEqual(['a', 'b', 'c', 'a'])
  })
})
