/**
 * PARCOURT l'application comme une tablee, et mesure ce qu'elle traverse.
 *
 * A NE PAS CONFONDRE avec `audit_navigateur.mjs`, et les deux sont utiles.
 * Celui-la ouvre chaque ecran ISOLEMENT par le pont d'apercu `?screen=`, sur
 * quatre gabarits, et il est meilleur que celui-ci pour comparer des tailles
 * d'ecran. Celui-ci fait l'inverse : un seul gabarit, mais un VRAI parcours -
 * saisir quatre prenoms, entrer, lancer chaque jeu, consulter ses regles,
 * revenir, rafraichir. C'est ce qui lui permet de voir ce qu'un ecran isole ne
 * peut pas montrer : un enchainement qui ne rend pas la partie, un bouton de
 * sortie qui ne sort pas, une tablee perdue au rechargement.
 *
 * Il a gagne sa place le jour de son ecriture, sur deux defauts qu'aucune autre
 * garde ne voyait : « Quitter » qui redonnait le jeu qu'on venait de quitter, et
 * une tablee vide apres un rafraichissement.
 *
 * CE QU'IL MESURE :
 *  - le debordement, dans les deux axes, ecran par ecran ;
 *  - l'alignement : les bords gauches et droits des blocs principaux doivent
 *    tomber sur la meme verticale, et le script rend l'ecart sinon ;
 *  - les cibles tactiles sous 44 points, mesurees sur le RENDU ;
 *  - l'homogeneite des tuiles du hub ;
 *  - LCP, CLS et INP, sur le build de production.
 *
 * USAGE : node scripts/parcours_navigateur.mjs [url]
 * L'url par defaut est http://localhost:5199, servie par
 * `npx vite preview --port 5199`. Un port different de celui de
 * `audit_navigateur.mjs` pour que les deux puissent tourner cote a cote.
 */
import { chromium, devices } from 'playwright'

const URL_BASE = process.argv[2] ?? 'http://localhost:5199'

// iPhone 12/13/14, le terrain de l'audit du 31/08. La densite compte : elle
// change la conversion entre points CSS et pixels de capture, et c'est ce
// decalage qui fait rater une mesure prise sur une capture d'ecran.
const TELEPHONE = {
  ...devices['iPhone 13'],
  viewport: { width: 390, height: 844 },
}

const TOLERANCE_PX = 1
const CIBLE_TACTILE_MIN = 44

const constats = []
function releve(niveau, ecran, message) {
  constats.push({ niveau, ecran, message })
}

/**
 * Attend qu'un element ne bouge plus.
 *
 * Les ecrans entrent avec un ressort et une echelle. Toute mesure prise pendant
 * l'animation est fausse, et fausse d'une facon qui ressemble a un vrai defaut :
 * une tuile a 0,96 d'echelle rend 42 points la ou le repos en fait 44, soit
 * exactement le seuil de la cible tactile. Deux releves identiques a la suite
 * valent mieux qu'un delai fixe, qui ne dit rien de la machine sur laquelle il
 * tourne.
 */
async function attendStabilite(page, selecteur, essais = 60) {
  let precedent = null
  for (let i = 0; i < essais; i += 1) {
    // La signature couvre TOUS les elements vises, pas seulement leur
    // conteneur. Les tuiles entrent en cascade : le cadre se stabilise bien
    // avant elles, et surveiller le cadre revenait a declarer stable une
    // grille encore en mouvement.
    const actuel = await page.evaluate((sel) => {
      const els = [...document.querySelectorAll(sel)]
      if (els.length === 0) return null
      return els
        .map((el) => {
          const r = el.getBoundingClientRect()
          return `${Math.round(r.width * 100)},${Math.round(r.height * 100)},${Math.round(r.top * 100)}`
        })
        .join('|')
    }, selecteur)
    if (actuel !== null && actuel === precedent) return true
    precedent = actuel
    await page.waitForTimeout(100)
  }
  return false
}

/** Debordement de la page, dans les deux axes. */
async function mesureDebordement(page, ecran, doitTenirEnHauteur) {
  const m = await page.evaluate(() => {
    const d = document.documentElement
    return {
      scrollW: d.scrollWidth,
      clientW: d.clientWidth,
      scrollH: d.scrollHeight,
      clientH: d.clientHeight,
    }
  })

  if (m.scrollW > m.clientW + TOLERANCE_PX) {
    releve('BLOQUANT', ecran, `deborde de ${m.scrollW - m.clientW} points en largeur (${m.scrollW} pour ${m.clientW})`)
  }
  if (doitTenirEnHauteur && m.scrollH > m.clientH + TOLERANCE_PX) {
    // On NOMME le coupable. « La page deborde » oblige a rejouer le parcours a
    // la main ; la liste des blocs les plus hauts dit tout de suite s'il s'agit
    // d'un vrai defaut de mise en page ou de deux ecrans momentanement montes
    // ensemble pendant une transition.
    const coupables = await page.evaluate(() => {
      const noeuds = [...document.querySelectorAll('#root *')]
        .map((el) => ({
          balise: el.tagName.toLowerCase(),
          classe: (el.className?.toString?.() ?? '').slice(0, 46),
          h: Math.round(el.getBoundingClientRect().height),
        }))
        .filter((n) => n.h > 400)
        .sort((a, b) => b.h - a.h)
        .slice(0, 4)
      return noeuds
    })
    const detail = coupables.map((c) => `${c.balise}.${c.classe} = ${c.h}pt`).join(' | ')
    releve(
      'IMPORTANT',
      ecran,
      `deborde de ${m.scrollH - m.clientH} points en hauteur alors que cet ecran doit tenir sans defilement. Blocs les plus hauts : ${detail}`,
    )
  }
  return m
}

/** Cibles tactiles sous le seuil, mesurees sur le rendu et non sur les classes. */
async function mesureCiblesTactiles(page, ecran) {
  const petites = await page.evaluate((seuil) => {
    /**
     * La zone REELLEMENT touchable, pseudo-elements compris.
     *
     * Le motif recommande pour agrandir une cible sans grossir le dessin est un
     * `::after` en position absolue avec des retraits negatifs. Il recoit bien
     * les evenements de pointeur, mais il n'existe pas dans le DOM :
     * `getBoundingClientRect` ne le voit pas. Une garde qui mesure la seule
     * boite de l'element accuse donc precisement le code qui a correctement
     * applique le remede - et une garde qui crie a tort finit desactivee.
     */
    const zoneTouchable = (el) => {
      const r = el.getBoundingClientRect()
      let { width, height } = r
      for (const pseudo of ['::after', '::before']) {
        const s = getComputedStyle(el, pseudo)
        if (!s || s.content === 'none' || s.position !== 'absolute') continue
        if (s.pointerEvents === 'none') continue
        const px = (v) => {
          const n = Number.parseFloat(v)
          return Number.isFinite(n) ? n : 0
        }
        // Un retrait NEGATIF agrandit la zone ; un retrait positif la reduit,
        // et on ne le compte pas : la boite de l'element reste touchable.
        width += Math.max(0, -px(s.left)) + Math.max(0, -px(s.right))
        height += Math.max(0, -px(s.top)) + Math.max(0, -px(s.bottom))
      }
      return { width, height }
    }

    const resultat = []
    for (const el of document.querySelectorAll('button, a[href], input, select, [role="button"], [role="tab"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (getComputedStyle(el).visibility === 'hidden') continue
      const zone = zoneTouchable(el)
      if (zone.width < seuil || zone.height < seuil) {
        const nom = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 42)
        resultat.push({
          nom,
          w: Math.round(zone.width),
          h: Math.round(zone.height),
          dessin: `${Math.round(r.width)}x${Math.round(r.height)}`,
        })
      }
    }
    return resultat
  }, CIBLE_TACTILE_MIN)

  for (const p of petites) {
    releve(
      'MINEUR',
      ecran,
      `cible tactile ${p.w}x${p.h} sous ${CIBLE_TACTILE_MIN} points (dessin ${p.dessin}) : « ${p.nom} »`,
    )
  }
}

/**
 * La REGLE d'alignement. Les blocs de premier niveau d'un ecran doivent partager
 * la meme verticale gauche et la meme verticale droite. Un ecart de plus d'un
 * point se voit, et c'est ce que reperait l'oeil sans savoir le nommer.
 */
async function mesureAlignement(page, ecran) {
  const blocs = await page.evaluate(() => {
    // Les enfants directs du conteneur d'ecran : en-tete, corps, pied.
    const racine =
      document.querySelector('main')?.parentElement ??
      document.querySelector('#root > div > div') ??
      document.body
    return [...racine.children]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        // On ignore ce qui est hors flux (calques, voiles) et l'invisible :
        // un element en position fixe n'a pas a s'aligner sur la colonne.
        return r.width > 40 && r.height > 8 && s.position !== 'fixed' && s.position !== 'absolute'
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName.toLowerCase(),
          gauche: Math.round(r.left * 10) / 10,
          droite: Math.round(r.right * 10) / 10,
        }
      })
  })

  if (blocs.length < 2) return blocs

  const gauches = [...new Set(blocs.map((b) => b.gauche))]
  const droites = [...new Set(blocs.map((b) => b.droite))]
  if (gauches.length > 1) {
    releve('MINEUR', ecran, `bords gauches non alignes : ${gauches.join(', ')} (ecart ${Math.round((Math.max(...gauches) - Math.min(...gauches)) * 10) / 10} pt)`)
  }
  if (droites.length > 1) {
    releve('MINEUR', ecran, `bords droits non alignes : ${droites.join(', ')} (ecart ${Math.round((Math.max(...droites) - Math.min(...droites)) * 10) / 10} pt)`)
  }
  return blocs
}

/**
 * LCP et CLS, releves sur le chargement initial.
 *
 * L'observateur est installe AVANT la navigation, via `addInitScript` : pose
 * apres, il manquerait les entrees deja emises, et rendrait un LCP absent qu'on
 * lirait a tort comme un LCP parfait.
 */
async function mesureWebVitals(contexte) {
  const page = await contexte.newPage()
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0, entrees: [] }
    try {
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries()) {
          window.__vitals.lcp = Math.max(window.__vitals.lcp, e.startTime)
          window.__vitals.entrees.push({ t: Math.round(e.startTime), el: e.element?.tagName ?? '?' })
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries()) {
          if (!e.hadRecentInput) window.__vitals.cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {
      // Navigateur sans ces types d'entree : on rend zero, et le rapport le dit.
    }
  })

  await page.goto(URL_BASE, { waitUntil: 'load' })
  // Le decalage se produit surtout pendant les animations d'entree, qui durent
  // moins d'une seconde. On laisse la page vivre au dela.
  await page.waitForTimeout(2500)
  const vitals = await page.evaluate(() => window.__vitals)

  const ressources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((r) => r.name.endsWith('.js'))
      .map((r) => ({ nom: r.name.split('/').pop(), taille: Math.round((r.encodedBodySize ?? 0) / 1024) }))
      .sort((a, b) => b.taille - a.taille)
      .slice(0, 8),
  )

  await page.close()
  return { vitals, ressources }
}

/**
 * Installe l'observateur d'INP.
 *
 * Il se pose APRES le chargement, contrairement a celui du LCP : l'INP mesure
 * des interactions, et il n'y en a aucune avant qu'on en provoque une.
 */
async function armeInp(page) {
  await page.evaluate(() => {
    window.__inp = 0
    try {
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries()) {
          // `interactionId` distingue une vraie interaction d'un evenement
          // quelconque. Sans ce filtre on mesurerait des `pointermove`.
          if (e.interactionId) window.__inp = Math.max(window.__inp, e.duration)
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 0 })
    } catch {
      // Type d'entree absent : le rapport annoncera zero et le dira.
    }
  })
}

/** Passe l'introduction et le bandeau de consentement, puis saisit la tablee. */
async function prepareTablee(page, prenoms) {
  await page.goto(URL_BASE, { waitUntil: 'load' })
  await page.waitForTimeout(500)

  const passer = page.getByRole('button', { name: /^passer$/i }).first()
  if (await passer.isVisible().catch(() => false)) {
    await passer.click()
    await page.waitForTimeout(500)
  }

  // Consentement : on refuse le non essentiel, choix le plus protecteur.
  const refuser = page.getByRole('button', { name: /tout refuser/i }).first()
  if (await refuser.isVisible().catch(() => false)) {
    await refuser.click()
    await page.waitForTimeout(400)
  }

  // Les champs portent « Joueur 1 », « Joueur 2 »... en texte d'invite. Deux
  // lignes existent au depart, les suivantes s'ouvrent avec « Une chaise de
  // plus ». Remplir le premier champ en boucle, ce que faisait la version
  // precedente, ne fait qu'ecraser le meme prenom quatre fois.
  for (let i = 0; i < prenoms.length; i += 1) {
    let champ = page.getByPlaceholder(`Joueur ${i + 1}`)
    if ((await champ.count()) === 0) {
      await page.getByRole('button', { name: /une chaise de plus/i }).click()
      await page.waitForTimeout(200)
      champ = page.getByPlaceholder(`Joueur ${i + 1}`)
    }
    await champ.fill(prenoms[i])
    await page.waitForTimeout(100)
  }
  await page.waitForTimeout(300)
}

async function main() {
  const navigateur = await chromium.launch()
  const contexte = await navigateur.newContext(TELEPHONE)

  const perf = await mesureWebVitals(contexte)

  const page = await contexte.newPage()

  // Un ecran vide vient presque toujours d'une exception qui a fait tomber
  // l'arbre React. Sans ces deux ecouteurs, le rapport dit « ecran vide » et
  // laisse chercher ; avec eux, il donne le message et la pile.
  const erreursPage = []
  page.on('pageerror', (e) => erreursPage.push(`exception : ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') erreursPage.push(`console : ${m.text().slice(0, 200)}`)
  })

  await prepareTablee(page, ['Alice', 'Bob', 'Chloé', 'David'])

  await attendStabilite(page, 'button')
  await mesureDebordement(page, 'saisie de la tablee', false)
  await mesureCiblesTactiles(page, 'saisie de la tablee')

  // Vers le hub. L'attente n'est pas un delai arbitraire : `AnimatePresence`
  // tourne en mode `wait`, donc l'ecran suivant n'est monte QU'APRES la sortie
  // du precedent. Attendre l'element plutot qu'un temps fixe est la seule
  // mesure qui ne depend pas de la vitesse de la machine.
  await page.getByRole('button', { name: /pousser la porte/i }).click()
  await page
    .getByRole('button', { name: /lance la soirée/i })
    .waitFor({ state: 'visible', timeout: 10000 })
    .catch(() => {})

  const surLeHub = await page.getByRole('button', { name: /lance la soirée/i }).isVisible().catch(() => false)
  if (!surLeHub) {
    // On DIT ce qu'on voit a la place. Un constat qui annonce seulement
    // « l'ecran attendu n'est pas la » oblige a rejouer le parcours a la main
    // pour savoir ou l'on a atterri.
    const vu = await page.evaluate(() => ({
      texte: document.body.innerText.replace(/\s+/g, ' ').slice(0, 160),
      champs: [...document.querySelectorAll('input[type="text"]')].map((i) => i.value),
      porteDesactivee: [...document.querySelectorAll('button')]
        .filter((b) => /pousser la porte/i.test(b.textContent ?? ''))
        .map((b) => b.disabled),
      stockage: Object.keys(localStorage),
      navigation: localStorage.getItem('bacchana-navigation'),
      jeu: localStorage.getItem('bacchana-game'),
      etatHistorique: history.state,
    }))
    console.error('NAVIGATION :', vu.navigation)
    console.error('JEU        :', vu.jeu)
    console.error('HISTORIQUE :', JSON.stringify(vu.etatHistorique))
    releve(
      'BLOQUANT',
      'hub',
      `le hub n'a pas ete atteint apres « Pousser la porte ». Champs : ${JSON.stringify(vu.champs)}, bouton desactive : ${JSON.stringify(vu.porteDesactivee)}, ecran persiste : ${vu.navigation}. Texte : « ${vu.texte} »`,
    )
  }

  // Les tuiles entrent en cascade, avec un ressort et une echelle qui part de
  // 0,96. Mesurer avant la fin donne des tailles fausses - 42 points la ou le
  // rendu final en fait 44 - et fait crier une garde sur une cible tactile qui
  // est en fait conforme. On attend que la mesure soit STABLE, plutot qu'un
  // delai fixe qui dependrait de la machine.
  await attendStabilite(page, '.grid.auto-rows-fr > div')

  await armeInp(page)
  await mesureDebordement(page, 'hub', false)
  await mesureCiblesTactiles(page, 'hub')
  const blocsHub = await mesureAlignement(page, 'hub')

  // Homogeneite des tuiles : c'est la mesure qui manquait, et l'oeil la voyait.
  const tuiles = await page.evaluate(() => {
    // La grille des MODES, reconnue a `auto-rows-fr`. Le selecteur precedent,
    // `.grid.grid-cols-2`, attrapait la rangee de deux boutons de l'en-tete et
    // mesurait donc autre chose que ce qu'il annonçait.
    const grille = document.querySelector('.grid.auto-rows-fr')
    if (!grille) return null
    return [...grille.children].map((el) => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })
  })
  if (tuiles && tuiles.length > 1) {
    const hauteurs = [...new Set(tuiles.map((t) => t.h))]
    const largeurs = [...new Set(tuiles.map((t) => t.w))]
    if (hauteurs.length > 1) {
      releve('IMPORTANT', 'hub', `tuiles de hauteurs differentes : ${hauteurs.join(', ')} points`)
    }
    if (largeurs.length > 1) {
      releve('IMPORTANT', 'hub', `tuiles de largeurs differentes : ${largeurs.join(', ')} points`)
    }
  }

  // --------------------------------------------- parcours de TOUS les jeux
  // Un ecran de jeu PROMET de tenir sans defilement. C'est la seule facon de
  // verifier qu'il tient, et il faut le faire sur les treize, pas sur un : les
  // defauts de mise en page ne se repartissent pas equitablement.
  const ecransDeJeu = []
  let inpMesure = 0

  const hub = () => page.getByRole('button', { name: /lance la soirée/i })
  const tuilesDeJeu = () => page.locator(// `:first-child` : chaque tuile est un `div` qui contient DEUX boutons, la
  // tuile elle-meme et sa pastille « Regles ». Sans cette precision, un tour sur
  // deux ouvrait les regles en croyant lancer un jeu, et le rapport annoncait
  // un ecran de jeu nomme « REGLES ».
  '.grid.auto-rows-fr > div > button:first-child')
  const nombreDeTuiles = await tuilesDeJeu().count()

  for (let index = 0; index < nombreDeTuiles; index += 1) {
    // La liste est relue A CHAQUE TOUR : on repasse par le hub entre deux jeux,
    // et une reference gardee d'un tour sur l'autre pointerait un noeud detache.
    const tuile = tuilesDeJeu().nth(index)
    if (!(await tuile.isVisible().catch(() => false))) continue

    const nomDuJeu = (await tuile.innerText().catch(() => `jeu ${index}`)).split('\n')[0].trim()
    const ecran = `jeu : ${nomDuJeu}`
    await tuile.click()
    await page.waitForTimeout(600)

    // Un selecteur de paquet peut s'interposer : on prend le premier paquet.
    const premierPaquet = page.locator('[role="dialog"] button').nth(1)
    if (await premierPaquet.isVisible().catch(() => false)) {
      await premierPaquet.click()
      await page.waitForTimeout(600)
    }

    // Le hub doit avoir DISPARU du document, pas seulement etre invisible.
    // `AnimatePresence` tourne en mode `wait` : pendant la sortie, les deux
    // ecrans coexistent, et le hub mesure plus de deux mille points de haut a
    // lui seul. Mesurer la page a cet instant fait accuser l'ecran de jeu d'un
    // debordement qui appartient a celui qu'il remplace.
    const parti = await hub()
      .waitFor({ state: 'detached', timeout: 8000 })
      .then(() => true)
      .catch(() => false)
    if (!parti) {
      releve('IMPORTANT', ecran, "la tuile ne lance pas de partie, le hub reste a l'ecran")
      continue
    }

    ecransDeJeu.push(nomDuJeu)

    // Les commandes fixes entrent en `scale: 0.8`. Mesurees en vol, elles
    // rendent 36 points la ou le repos en fait 44, ce qui fabrique un faux
    // constat de cible tactile trop petite.
    await attendStabilite(page, 'button')
    await mesureDebordement(page, ecran, true)
    await mesureCiblesTactiles(page, ecran)

    // Consulter les regles ne doit pas couter la partie. Le seul repere fiable
    // est l'absence du hub : chercher un bouton precis comme « Fait » ne vaut
    // que pour les modes a cartes, et faisait crier la garde sur un quiz sain.
    const regles = page.getByRole('button', { name: /voir les règles/i }).first()
    if (await regles.isVisible().catch(() => false)) {
      await regles.click()
      await page.waitForTimeout(800)
      await mesureDebordement(page, `regles : ${nomDuJeu}`, false)
      await page.goBack()
      await page.waitForTimeout(1000)
      if (await hub().isVisible().catch(() => false)) {
        releve('BLOQUANT', ecran, 'consulter les regles renvoie au hub au lieu de rendre la partie')
      }
    }

    if (index === 0) {
      // Un seul rafraichissement suffit a prouver la reprise, et il coute une
      // seconde et demie par jeu si on le rejoue treize fois.
      //
      // L'INP se lit AVANT le rechargement : `window.__inp` vit dans la page, et
      // un rechargement l'emporte avec le reste. C'est ainsi qu'on rapporte
      // fierement un INP de zero apres avoir efface la mesure.
      inpMesure = await page.evaluate(() => window.__inp ?? 0).catch(() => 0)

      // On releve le point de reprise AVANT de recharger. Sans lui, un echec
      // dit seulement « on est revenu a la saisie » et laisse deviner si c'est
      // l'ecriture du point de reprise ou sa relecture qui a manque.
      const avantRefresh = await page.evaluate(() => ({
        reprise: localStorage.getItem('bacchana-reprise'),
        cles: Object.keys(localStorage).join(', '),
      }))

      await page.reload({ waitUntil: 'load' })
      await page.waitForTimeout(1400)
      const apresRefresh = await page.evaluate(() =>
        document.body.innerText.replace(/\s+/g, ' ').slice(0, 90),
      )
      if (/la tablée|pousser la porte/i.test(apresRefresh)) {
        const apres = await page.evaluate(() => {
          const lire = (cle) => {
            try {
              return JSON.parse(localStorage.getItem(cle) ?? 'null')
            } catch {
              return 'illisible'
            }
          }
          const jeu = lire('bacchana-game')
          return {
            reprise: localStorage.getItem('bacchana-reprise'),
            joueurs: jeu?.state?.players?.length ?? 'absent',
            majLe: jeu?.state?.majLe ?? 'absent',
            phase: jeu?.state?.gamePhase ?? 'absent',
          }
        })
        releve(
          'BLOQUANT',
          ecran,
          `un rafraichissement renvoie a la saisie des joueurs. AVANT, point de reprise : ${avantRefresh.reprise}. APRES, point de reprise : ${apres.reprise}, joueurs persistes : ${apres.joueurs}, phase : ${apres.phase}. Ecran obtenu : « ${apresRefresh} »`,
        )
      }
      await armeInp(page)
    }

    // Retour au hub pour le jeu suivant. Il y a PLUSIEURS sorties selon l'ecran
    // ou l'on se trouve : le bouton de sortie, sa confirmation, et l'ecran de
    // fin - l'addition - qui apparait quand la manche se termine. Un seul
    // chemin ne suffit pas, et une premiere version qui ne connaissait que
    // « Quitter » restait bloquee sur le ticket de caisse.
    const sorties = [
      /quitter quand même/i,
      /retour à l'accueil|retour a l'accueil/i,
      /^quitter/i,
      // Le bouton de l'ecran de SAISIE des joueurs. Il est en dernier : on ne
      // veut pas passer par lui, on veut savoir quand on y a ete pousse.
      /revenir à l'accueil/i,
    ]

    // Quitter un jeu doit rendre le HUB. Atterrir sur la saisie des joueurs est
    // un detour que personne n'a demande, et qui donne l'impression d'avoir
    // perdu sa tablee alors qu'elle est intacte.
    const passeParLaSaisie = async () =>
      page.getByRole('button', { name: /pousser la porte/i }).isVisible().catch(() => false)
    let revenu = false
    for (let essai = 0; essai < 6 && !revenu; essai += 1) {
      // Garde-fou : a force de reculer, on finit par SORTIR du site. La page
      // n'a alors plus de `#root`, le rapport annonce un ecran vide, et on
      // accuse l'application d'un blanc qui vient du script. On revient sur
      // l'application plutot que de continuer a mesurer une page etrangere.
      if (!page.url().startsWith(URL_BASE)) {
        await page.goto(URL_BASE, { waitUntil: 'load' }).catch(() => {})
        await page.waitForTimeout(900)
      }

      if (await hub().isVisible().catch(() => false)) {
        revenu = true
        break
      }
      if (essai > 0 && (await passeParLaSaisie())) {
        releve('IMPORTANT', ecran, 'quitter ce jeu passe par la saisie des joueurs au lieu de rendre le hub')
      }
      let clique = false
      for (const motif of sorties) {
        const bouton = page.getByRole('button', { name: motif }).first()
        if (await bouton.isVisible().catch(() => false)) {
          await bouton.click().catch(() => {})
          clique = true
          break
        }
      }
      // Le retour navigateur n'est tente qu'UNE fois par jeu : c'est le seul
      // geste qui peut quitter le site, les autres restent dans l'application.
      if (!clique && essai === 0) await page.goBack().catch(() => {})

      // On ATTEND le hub plutot qu'un delai fixe. Sept cents millisecondes
      // suffisaient la plupart du temps et pas toujours : le rapport accusait
      // alors l'application d'un retour impossible, sur un ecran qui allait
      // arriver. Un verdict qui depend de la vitesse de la machine n'est pas un
      // verdict.
      await hub()
        .waitFor({ state: 'visible', timeout: 4000 })
        .catch(() => {})
    }
    if (!revenu) {
      revenu = await hub()
        .waitFor({ state: 'visible', timeout: 6000 })
        .then(() => true)
        .catch(() => false)
    }
    if (!revenu) {
      const vu = await page.evaluate(() => ({
        texte: document.body.innerText.replace(/\s+/g, ' ').slice(0, 90),
        racine: document.getElementById('root')?.innerHTML.length ?? 0,
        boutons: [...document.querySelectorAll('button')]
          .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 26))
          .filter(Boolean)
          .slice(0, 8),
      }))
      const erreurs = erreursPage.length ? ` Erreurs : ${erreursPage.slice(-3).join(' | ')}` : ' Aucune erreur en console.'
      releve(
        'BLOQUANT',
        ecran,
        `impossible de revenir au hub depuis ce jeu. Texte : « ${vu.texte} », taille du rendu : ${vu.racine} caracteres, boutons vus : ${vu.boutons.join(' / ') || 'aucun'}.${erreurs}`,
      )
      break
    }
    await attendStabilite(page, '.grid.auto-rows-fr > div')
  }

  const inp = inpMesure

  await navigateur.close()

  // ----------------------------------------------------------------- rapport
  const l = console.log
  l('')
  l('=== Mesure des ecrans, viewport 390 x 844 ===')
  l('')
  l('Chargement initial')
  l(`  LCP  : ${Math.round(perf.vitals.lcp)} ms`)
  l(`  CLS  : ${perf.vitals.cls.toFixed(4)}`)
  l(`  INP  : ${Math.round(inp)} ms (pire interaction du parcours)`)
  l('  Plus gros scripts transferes :')
  for (const r of perf.ressources) l(`    ${String(r.taille).padStart(5)} Ko  ${r.nom}`)
  l(`  Total JS initial : ${perf.ressources.reduce((s, r) => s + r.taille, 0)} Ko`)
  l('')
  l(`Hub : ${blocsHub.length} blocs de premier niveau mesures`)
  if (tuiles) l(`Tuiles : ${tuiles.length}, ${tuiles[0]?.w} x ${tuiles[0]?.h} points`)
  if (ecransDeJeu.length > 0) l(`Ecrans de jeu parcourus : ${ecransDeJeu.join(', ')}`)
  l('')

  if (constats.length === 0) {
    l('Aucun constat. Debordement, alignement et cibles tactiles sont conformes.')
  } else {
    for (const niveau of ['BLOQUANT', 'IMPORTANT', 'MINEUR']) {
      const lot = constats.filter((c) => c.niveau === niveau)
      if (lot.length === 0) continue
      l(`${niveau} (${lot.length})`)
      for (const c of lot) l(`  [${c.ecran}] ${c.message}`)
      l('')
    }
  }

  const bloquants = constats.filter((c) => c.niveau === 'BLOQUANT').length
  process.exit(bloquants > 0 ? 1 : 0)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})
