/**
 * Attente de stabilité d'opacité avant toute mesure de contraste.
 *
 * framer-motion anime la plupart des entrées d'écran (opacity 0 -> 1, souvent
 * en cascade sur une grille) en pilotant directement la propriété CSS
 * `opacity` image par image - via la Web Animations API quand c'est possible,
 * mais aussi en JS pur (rAF) pour certains ressorts, auquel cas
 * `document.getAnimations()` ne les voit PAS (liste vide = "déjà stable" à
 * tort). Un axe.run() lancé une frame trop tôt mesure une couleur mi-fondu -
 * un aplat "pop-pink" à 30 % d'opacité sur une page sombre se lit comme un
 * quasi-noir, faux positif classique qui n'a rien à voir avec un vrai bug de
 * contraste (observé et diagnostiqué lors de l'audit visuel du 2026-08-05).
 *
 * La méthode robuste, indépendante du moteur d'animation : interroger
 * `getComputedStyle(el).opacity` de TOUS les éléments et attendre que deux
 * relevés consécutifs (150 ms d'écart) soient identiques.
 */
export async function settle(page, timeoutMs = 4000) {
  const start = Date.now()
  let last = ''
  let stable = 0
  while (Date.now() - start < timeoutMs) {
    const snapshot = await page
      .evaluate(() =>
        Array.from(document.querySelectorAll('body *'))
          .map((el) => getComputedStyle(el).opacity)
          .join(',')
      )
      .catch(() => 'ERR')
    if (snapshot === last) {
      stable += 1
      if (stable >= 2) break
    } else {
      stable = 0
    }
    last = snapshot
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(150)
}
