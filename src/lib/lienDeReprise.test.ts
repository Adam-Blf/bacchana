import { describe, it, expect, beforeEach } from 'vitest'
import {
  DUREE_ANNONCEE_MS,
  enregistrerLienDeReprise,
  lienProbablementPerime,
  lireLienDeReprise,
  oublierLienDeReprise,
} from './lienDeReprise'

const CLE = 'bacchana-lien-de-reprise'

describe('lien de reprise', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("rend null quand rien n'a jamais été acheté", () => {
    expect(lireLienDeReprise()).toBeNull()
  })

  it('relit ce qui a été écrit', () => {
    enregistrerLienDeReprise('https://reprise.example/abc', 1_000)
    expect(lireLienDeReprise()).toEqual({ url: 'https://reprise.example/abc', emisLe: 1_000 })
  })

  it('survit à une fermeture d\'onglet - c\'est tout son intérêt', () => {
    enregistrerLienDeReprise('https://reprise.example/abc', 1_000)
    // Le stockage est la seule chose qui traverse un rechargement : on relit sans passer
    // par la valeur rendue plus haut.
    expect(JSON.parse(window.localStorage.getItem(CLE) as string).url).toBe(
      'https://reprise.example/abc'
    )
  })

  it('oublie sur demande explicite', () => {
    enregistrerLienDeReprise('https://reprise.example/abc')
    oublierLienDeReprise()
    expect(lireLienDeReprise()).toBeNull()
  })

  describe('une valeur trafiquée se traite comme une absence, jamais comme une donnée', () => {
    const casInvalides: [string, string][] = [
      ['du texte qui n\'est pas du JSON', 'pas du json'],
      ['un JSON qui n\'est pas un objet', '"https://reprise.example"'],
      ['null', 'null'],
      ['un objet sans url', '{"emisLe":1000}'],
      ['une url vide', '{"url":"","emisLe":1000}'],
      ['une url qui n\'est pas une chaîne', '{"url":42,"emisLe":1000}'],
      ['un horodatage absent', '{"url":"https://reprise.example"}'],
      ['un horodatage non fini', '{"url":"https://reprise.example","emisLe":null}'],
    ]
    for (const [nom, valeur] of casInvalides) {
      it(nom, () => {
        window.localStorage.setItem(CLE, valeur)
        expect(lireLienDeReprise()).toBeNull()
      })
    }
  })

  describe('péremption', () => {
    it('ne signale rien dans l\'heure', () => {
      const lien = { url: 'https://reprise.example', emisLe: 1_000_000 }
      expect(lienProbablementPerime(lien, 1_000_000 + DUREE_ANNONCEE_MS - 1)).toBe(false)
    })

    it('signale au-delà de l\'heure annoncée', () => {
      const lien = { url: 'https://reprise.example', emisLe: 1_000_000 }
      expect(lienProbablementPerime(lien, 1_000_000 + DUREE_ANNONCEE_MS + 1)).toBe(true)
    })

    it('ne fait qu\'avertir : le lien reste lisible une fois périmé', () => {
      // Un lien périmé garde de la valeur - c'est ce qui permet à l'application mobile de
      // dire « ce lien a expiré » plutôt que de laisser le joueur devant rien. L'effacer
      // serait retirer la porte au lieu de réparer la serrure.
      enregistrerLienDeReprise('https://reprise.example/abc', 0)
      expect(lireLienDeReprise()?.url).toBe('https://reprise.example/abc')
    })
  })
})
