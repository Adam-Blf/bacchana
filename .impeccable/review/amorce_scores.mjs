/**
 * Les deux registres de scores, amorcés pour un navigateur piloté.
 *
 * La fiche de score a besoin de DONNÉES pour exister : à vide elle affiche son
 * état vide, et une capture d'état vide ne prouve rien de la mise en page. Le
 * jeu ci-dessous porte exprès ce qu'une feuille doit savoir montrer - une
 * égalité en tête, un ex aequo plus bas, et des nombres de parties différents.
 *
 * Les formes suivent le middleware `persist` de zustand ({ state, version }).
 */
export function amorcerScores(page) {
  return page.addInitScript(() => {
    try {
      const maintenant = Date.now()
      // Huit joueurs : la tablée maximale. C'est le cas qui serre le plus les
      // colonnes, donc le seul qui prouve quelque chose sur un petit écran.
      const noms = [
        'Alice',
        'Bob',
        'Chloé',
        'Dimitri',
        'Églantine',
        'Fabrice',
        'Gwenaëlle',
        'Hyacinthe',
      ]
      const totaux = [12, 9, 9, 7, 6, 4, 3, 1]
      const parties = [4, 4, 3, 4, 2, 4, 2, 1]

      const ledger = {}
      noms.forEach((nom, i) => {
        ledger[`j${i + 1}`] = { name: nom, total: totaux[i], games: parties[i] }
      })
      localStorage.setItem(
        'bacchana-ardoise',
        JSON.stringify({
          state: {
            ledger,
            gamesPlayed: 4,
            modesPlayed: ['truthOrDare', 'picolo', 'quiz'],
            majLe: maintenant,
          },
          version: 0,
        })
      )

      const lignes = {}
      const palmes = [3, 1, 2, 0, 1, 0, 2, 0]
      const cumul = [38, 31, 31, 24, 19, 17, 12, 5]
      const parties2 = [11, 9, 9, 8, 6, 6, 4, 2]
      const modes = [
        ['truthOrDare', 'picolo', 'quiz'],
        ['truthOrDare', 'neverHaveIEver'],
        ['picolo', 'whoAmong'],
        ['quiz'],
        ['truthOrDare'],
        ['quiz', 'picolo'],
        ['whoAmong'],
        ['quiz'],
      ]
      noms.forEach((nom, i) => {
        lignes[nom.toLowerCase()] = {
          nom,
          parties: parties2[i],
          penalites: cumul[i],
          palmes: palmes[i],
          modes: modes[i],
          derniereFois: maintenant - i * 86400000,
        }
      })
      localStorage.setItem(
        'bacchana-palmares',
        JSON.stringify({ state: { lignes }, version: 0 })
      )
    } catch {
      /* document sans stockage */
    }
  })
}
