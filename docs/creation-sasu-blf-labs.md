# Création SASU BLF Labs - plan d'exécution

Version 1.1.0 - 2026-08-11

**Arbitrages tranchés le 11/08/2026**
- Siège social : **domicile**, 6 Impasse Edouard Vaillant, 94550 Chevilly-Larue. Conséquence
  assumée : adresse publiée au Kbis et sur les fiches App Store et Play (DSA).
- Statuts : **rédigés en interne**, modèle complet dans
  `Documents/Sensible/SASU_BLF_Labs/statuts_blf_labs.md`, annexes et attestations dans
  `annexes_dossier_constitution.md`. Relecture avocat ou expert-comptable recommandée avant dépôt.
- Micro-entreprise : **conservée** pour les prestations freelance, la SASU porte l'édition
  d'applications. Justification fiscale à l'article 6 bis.

Objectif : disposer d'une personne morale pour être éditeur **BLF Labs** sur l'App Store
(Apple refuse l'entreprise individuelle en compte Organisation) et sur Google Play.
Voir [stores-comptes-developpeur.md](stores-comptes-developpeur.md) pour la partie stores.

Existant : EI **Adam Beloucif**, SIREN 108386855, créée le 04/08/2026, micro-BNC, NAF 6201Z.

---

## 1. Vérifications déjà faites

- **Dénomination "BLF Labs"** : recherche data.inpi.fr du 11/08/2026 - 0 société, 0 marque,
  0 brevet, 0 dessin/modèle à ce nom. Le seul résultat est l'EI Adam Beloucif elle-même.
  La dénomination sociale est donc libre à cette date.
- Réflexe complémentaire : vérifier la disponibilité de la marque **BLF Labs** en classes 9
  (logiciels), 41 (jeux, divertissement) et 42 (services informatiques) avant dépôt INPI.
  Le domaine blflabs.com est déjà réservé, ce qui verrouille le volet numérique.

## 2. Point de vigilance statut personnel

Adam est en alternance dans un établissement public de santé (Fondation Vallée / GHT Sud Paris).

- L'apprenti du secteur public est employé sous **contrat de droit privé** (code du travail).
  Le régime de cumul d'activités des agents publics, qui interdit en principe de diriger une
  société, **ne s'applique pas aux agents de droit privé**.
- À confirmer avant signature des statuts : le type exact de contrat (apprentissage vs
  contrat de droit public) et l'existence d'une **clause d'exclusivité** ou de loyauté.
  Si le contrat est de droit public, la présidence d'une SASU suppose une autorisation
  hiérarchique et un passage à temps partiel - ce qui est incompatible avec l'alternance.
- Ce point n'est pas un conseil juridique engageant. En cas de doute, faire valider par les RH
  de l'établissement ou un avocat.

## 3. Étapes de création

| # | Étape | Détail | Délai |
| --- | --- | --- | --- |
| 1 | Siège social | domicile personnel (attestation de domiciliation par le président, autorisée) ou société de domiciliation. L'adresse figure au Kbis et sera publiée sur les fiches stores (DSA). | J0 |
| 2 | Statuts | objet social large : conception, développement, édition, exploitation et commercialisation de logiciels, applications mobiles, jeux et sites web ; prestations de services informatiques et de conseil en données. Président : Adam Beloucif, non rémunéré au départ. Exercice social au 31/12. | J0 à J+3 |
| 3 | Dépôt du capital | banque en ligne (Qonto, Shine) ou banque traditionnelle. Minimum légal 1 €, **1 000 € recommandés** pour la crédibilité bancaire et D&B. 50 % libérés minimum à la création. Récupérer l'attestation de dépôt. | 1 à 3 j |
| 4 | Annonce légale | support habilité du Val-de-Marne, tarif forfaitaire **142 € HT** pour une SASU en métropole. | 1 j |
| 5 | Dossier guichet unique INPI | statuts signés, attestation de dépôt des fonds, attestation de parution de l'annonce légale, justificatif de jouissance du siège, pièce d'identité, déclaration de non-condamnation avec filiation, déclaration des bénéficiaires effectifs. | J+3 |
| 6 | Immatriculation RCS Créteil | délivrance du Kbis et du SIREN de la société. | 7 à 15 j |
| 7 | Post-création | déblocage du capital sur le compte pro, RC professionnelle, expert-comptable, registre des mouvements de titres, activation du numéro de TVA intracommunautaire. | J+15 |

## 4. Coûts

| Poste | Montant |
| --- | --- |
| Annonce légale | 142 € HT |
| Greffe (immatriculation RCS) | ~34 € |
| Déclaration des bénéficiaires effectifs | ~20 € |
| **Total création incompressible** | **~195 à 250 €** |
| Statuts par legaltech ou avocat (optionnel) | 0 € en DIY, 100 à 300 € legaltech, 800 à 1 500 € avocat |
| Expert-comptable annuel | 400 à 1 500 € |
| Domiciliation commerciale (optionnel) | 15 à 30 € par mois |

## 5. Fiscal et social

- **IS** par défaut : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà.
- **Président non rémunéré** : aucune cotisation sociale, mais aucun droit acquis. La couverture
  sociale reste celle de l'alternance. L'ACRE n'a d'intérêt que si le président se rémunère.
- **Dividendes** : flat tax 30 % (12,8 % IR + 17,2 % prélèvements sociaux).
- **TVA** : la SASU est au régime réel, donc TVA collectée et déductible, et numéro de TVA
  intracommunautaire attribué d'office. Cela règle au passage le sujet de l'autoliquidation sur
  les factures Apple Irlande et Google Irlande.
- **Comptabilité** : bilan, compte de résultat, annexe, dépôt des comptes annuels. C'est le vrai
  surcoût par rapport à la micro-entreprise.

## 6. Que devient l'entreprise individuelle

Trois options, à trancher :

1. **La garder** pour les missions freelance et le conseil, et loger uniquement l'édition
   d'applications dans la SASU. Deux structures à gérer, mais séparation nette.
2. **La fermer** (cessation d'activité au guichet unique INPI, gratuit) et tout basculer dans la
   SASU. Plus simple, mais on perd le régime micro très léger pour du freelance ponctuel.
3. La laisser dormante sans chiffre d'affaires. Déclarations à zéro à maintenir, peu d'intérêt.

Éviter d'exercer exactement la même activité facturée des deux côtés sans justification.

### 6 bis. Pourquoi garder l'EI est le choix le plus avantageux fiscalement

Comparaison à volume modeste, pour 10 000 € de prestations freelance encaissées :

| | Micro-BNC (EI) | SASU |
| --- | --- | --- |
| Charges sociales | ~24,6 % du chiffre d'affaires, soit ~2 460 € | 0 € si le président ne se rémunère pas, ~80 % du net s'il se rémunère |
| Base imposable | 66 % du CA après abattement de 34 % | bénéfice réel après charges |
| Impôt | IR au taux marginal, faible ici car le salaire d'apprenti est largement exonéré | IS 15 % jusqu'à 42 500 €, puis 30 % de flat tax pour sortir la trésorerie en dividendes, soit ~40,75 % cumulés |
| Frais fixes | 0 € de comptabilité | 400 à 1 500 € par an d'expert-comptable |

Conclusion : les revenus des stores n'ont pas le choix, ils tombent dans la SASU puisque le
compte développeur est au nom de la société. En revanche, les missions de prestation restent
nettement moins taxées en micro-BNC, sans frais de structure. On garde donc les deux, avec une
séparation nette : **prestations et conseil dans l'EI, édition et exploitation d'applications
dans la SASU**. Réexamen après le premier exercice, et fermeture de l'EI si aucune mission
freelance n'est facturée sur douze mois.

## 7. Enchaînement vers les stores

1. Kbis obtenu → nouveau SIREN de la SASU.
2. Demander le **D-U-N-S** avec les données de la SASU (5 à 30 jours). C'est le chemin critique.
3. Mettre **blflabs.com** en ligne au nom de BLF Labs, avec mentions légales de la société
   (dénomination, SASU, capital, RCS Créteil, SIREN, siège, contact, hébergeur), et créer une
   adresse email **@blflabs.com**. Apple exige un site fonctionnel et un email au domaine.
4. **Apple Developer Program - Organisation** : 99 USD par an, vérification D-U-N-S + autorité
   de signature (le président), puis statut de trader DSA dans App Store Connect.
5. **Google Play Console - Organisation** : 25 USD une fois, D-U-N-S, vérifications d'identité.
6. Ne pas ouvrir les comptes stores au nom de l'EI entre-temps : le transfert d'un compte Play
   vers une autre entité et la conversion Apple Individual vers Organisation sont pénibles.

## 8. Calendrier réaliste

| Jalon | Date cible |
| --- | --- |
| Statuts signés, capital déposé, annonce légale publiée | S+1 |
| Dossier déposé au guichet unique | S+1 |
| Kbis et SIREN | S+2 à S+4 |
| D-U-N-S attribué | S+3 à S+8 |
| Compte Google Play Organisation actif | S+4 à S+9 |
| Compte Apple Developer Organisation actif | S+4 à S+9 |

Soit **6 à 8 semaines** avant de pouvoir publier sous le nom BLF Labs, dominées par le D-U-N-S.

## 9. Checklist

- [ ] Vérifier le type de contrat d'alternance et l'absence de clause d'exclusivité
- [ ] Trancher le siège social (domicile ou domiciliation)
- [ ] Trancher le sort de l'EI (garder, fermer, dormante)
- [ ] Rédiger et signer les statuts
- [ ] Déposer le capital et récupérer l'attestation
- [ ] Publier l'annonce légale
- [ ] Déposer le dossier au guichet unique INPI
- [ ] Récupérer le Kbis
- [ ] Ouvrir le compte bancaire pro et débloquer le capital
- [ ] Demander le D-U-N-S
- [ ] Publier blflabs.com avec mentions légales et email pro
- [ ] Ouvrir Apple Developer Organisation
- [ ] Ouvrir Google Play Console Organisation
- [ ] Déposer la marque BLF Labs à l'INPI (classes 9, 41, 42)

## Sources

- data.inpi.fr, recherche entreprises et marques "BLF Labs" du 11/08/2026
- entreprendre.service-public.fr et guides de création SASU 2026 (tarif annonce légale 142 € HT)
- legifrance.gouv.fr, règles de cumul des agents publics (CGFP art. L123-1 et suivants)
- developer.apple.com/programs/enroll et support.google.com/googleplay/android-developer
