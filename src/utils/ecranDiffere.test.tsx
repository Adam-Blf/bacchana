import { describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import { render, screen, act } from '@testing-library/react'
import { differer } from './ecranDiffere'

/**
 * Ce qui est verifie ici, c'est LE MECANISME, pas la forme : qu'un ecran
 * precharge se rende SANS passer par le repli de `Suspense`. C'est ce passage
 * par le repli qui coutait 300 ms de bride React, et aucune garde de forme ne
 * peut le voir - `check_transitions` refuse un `lazy()` mal place, elle ne
 * prouve pas que le remplacant evite la suspension.
 */
describe('differer', () => {
  function fabrique(texte: string) {
    return () => Promise.resolve({ default: () => <p>{texte}</p> })
  }

  it('rend le repli quand rien n a ete precharge', async () => {
    const [Ecran] = differer(fabrique('palmares'))
    render(
      <Suspense fallback={<p>attente</p>}>
        <Ecran />
      </Suspense>
    )
    expect(screen.getByText('attente')).toBeTruthy()
    expect(await screen.findByText('palmares')).toBeTruthy()
  })

  it('rend l ecran SANS repli quand il a ete precharge', async () => {
    const [Ecran, precharger] = differer(fabrique('catalogue'))
    await precharger()
    render(
      <Suspense fallback={<p>attente</p>}>
        <Ecran />
      </Suspense>
    )
    // Synchrone : pas de `findBy`, pas d'attente. Si le repli apparaissait,
    // meme un instant, la bride de 300 ms reviendrait avec lui.
    expect(screen.queryByText('attente')).toBeNull()
    expect(screen.getByText('catalogue')).toBeTruthy()
  })

  it('retombe sur le chargement normal quand le prechargement echoue', async () => {
    let essais = 0
    const [Ecran, precharger] = differer(() => {
      essais++
      return essais === 1 ? Promise.reject(new Error('reseau')) : Promise.resolve({ default: () => <p>reglages</p> })
    })
    // Le rejet est avale : precharger() ne doit pas propager l'erreur.
    await expect(precharger()).resolves.toBeUndefined()
    render(
      <Suspense fallback={<p>attente</p>}>
        <Ecran />
      </Suspense>
    )
    expect(screen.getByText('attente')).toBeTruthy()
    expect(await screen.findByText('reglages')).toBeTruthy()
  })

  it('ne change pas de composant en cours de route si le prechargement finit apres le montage', async () => {
    const [Ecran, precharger] = differer(fabrique('regles'))
    render(
      <Suspense fallback={<p>attente</p>}>
        <Ecran />
      </Suspense>
    )
    await act(async () => {
      await precharger()
    })
    // Un seul rendu de l'ecran : s'il avait change de type, React l'aurait
    // demonte et remonte, et l'ecran aurait perdu son etat au passage.
    expect(screen.getAllByText('regles')).toHaveLength(1)
  })
})
