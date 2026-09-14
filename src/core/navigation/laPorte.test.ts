import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { bindNavigation, navPush, navBack, navHome, __resetNavigationForTests } from './history'
import type { AppScreen } from '@/types'

const tick = () => new Promise((r) => setTimeout(r, 100))

/**
 * « POUSSER LA PORTE » OUVRE LE HUB, D'OU QU'ON VIENNE.
 *
 * Ce bouton a rate sa destination DEUX FOIS, et les deux fois parce qu'il
 * PARIAIT sur ce qui se trouve sous l'ecran d'accueil.
 *
 * 1. Il a parie sur `hasPlayers()` - « on n'arrive ici avec une tablee que
 *    depuis le hub ». Faux : les joueurs sont persistes, donc a la deuxieme
 *    ouverture la tablee de la veille est encore la alors que l'accueil est la
 *    RACINE. Le retour tombait dans la trappe de sortie et l'application se
 *    fermait.
 *
 * 2. Il a parie sur `peutRemonter()` - « s'il y a un ecran dessous, c'est le
 *    hub ». Faux aussi, et remonte depuis la production le 2026-09-14 :
 *    « pousser la porte revient a la page d'avant ». L'accueil s'atteint depuis
 *    les reglages, depuis le catalogue, apres un aller-retour par les regles.
 *
 * Ces tests ne verifient donc pas « le retour marche » mais « la porte ARRIVE
 * AU HUB », depuis chacun des chemins qui l'ont fait echouer. C'est la seule
 * formulation qui aurait attrape les deux defauts.
 *
 * CE QU'ILS NE VOIENT PAS : ils exercent la couche de navigation, pas le
 * composant. Un `WelcomeScreen` qui rebrancherait son bouton sur `goBack()`
 * les laisserait verts. C'est la limite assumee d'un test de couche.
 */
describe('la porte ouvre le hub', () => {
  let screen: AppScreen
  let sorties: number

  beforeEach(() => {
    __resetNavigationForTests()
    screen = 'welcome'
    sorties = 0
    bindNavigation({
      applyScreen: (s) => { screen = s },
      getScreen: () => screen,
      // Rien ne tourne : la trappe de sortie fermerait reellement l'app. C'est
      // exactement la condition du premier defaut, et on la garde pour que le
      // retour de ce defaut se voie.
      peutQuitter: () => { sorties += 1; return false },
    })
  })
  afterEach(() => __resetNavigationForTests())

  it('depuis la racine, sans jamais toucher la trappe de sortie', async () => {
    navHome()
    await tick()
    expect(screen).toBe('hub')
    expect(sorties).toBe(0)
  })

  it('depuis le hub, par « modifier la tablee »', async () => {
    screen = 'hub'
    navPush('welcome')
    navHome()
    await tick()
    expect(screen).toBe('hub')
  })

  it('depuis les reglages - le chemin signale en production', async () => {
    screen = 'hub'
    navPush('settings')
    navPush('welcome')
    navHome()
    await tick()
    expect(screen).toBe('hub')
  })

  it('apres un aller-retour par les regles et un passage au catalogue', async () => {
    screen = 'hub'
    navPush('welcome')
    navPush('rules')
    navBack()
    await tick()
    navPush('catalogue')
    navPush('welcome')
    navHome()
    await tick()
    expect(screen).toBe('hub')
  })

  it('depuis un empilement profond, sans laisser d ecran intermediaire', async () => {
    screen = 'hub'
    for (const e of ['settings', 'rules', 'catalogue', 'palmares', 'welcome'] as AppScreen[]) navPush(e)
    navHome()
    await tick()
    expect(screen).toBe('hub')
    // Un seul retour supplementaire doit atteindre la trappe, donc la racine
    // est bien a un cran : rien n'est reste empile au-dessus.
    navBack()
    await tick()
    expect(sorties).toBe(1)
  })
})
