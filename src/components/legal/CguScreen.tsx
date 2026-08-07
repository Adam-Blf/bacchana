import { LegalLayout, LegalSection } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * CGU/CGV - transcription de bacchana-content/legal/cgu-cgv.md (v1.14.0).
 * Modele produit : acces premium a vie (paiement unique, 12,99 EUR) + packs a
 * la carte (1,99 EUR l'unite, credites sur l'acces a vie), sans compte
 * utilisateur, sans abonnement, sans essai gratuit.
 * [ADRESSE] -> "adresse communiquee sur demande legitime".
 */

/**
 * Version des CGU/CGV en vigueur - reprise telle quelle par PremiumPaywallModal pour
 * rattacher la preuve de double consentement (art. 14) à la version acceptée. Source
 * unique : ne jamais dupliquer cette chaîne ailleurs.
 */
// Bumpee le 2026-08-07 : ajout du credit des packs sur l'acces a vie (art. 10) et
// passage du pack de 2,99 a 1,99. La version est stockee avec le consentement de
// l'utilisateur au moment de l'achat, elle doit donc bouger a chaque modification
// des conditions, sinon on ne saurait plus a quoi un client a consenti.
export const CGU_VERSION = 'Version applicable au 7 août 2026'

export function CguScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="CGU / CGV" version={CGU_VERSION}>
      <p className="font-hud text-label uppercase tracking-widest text-ink-muted">
        Partie 1 - Conditions générales d&apos;utilisation
      </p>

      <LegalSection title="1. Objet">
        <p>
          Les présentes CGU régissent l&apos;accès et l&apos;utilisation du service Bacchana, jeu de société
          numérique de soirée, édité par Adam Beloucif, exerçant sous le nom commercial BLF Lab&apos;s (voir{' '}
          <button onClick={() => navigateTo('mentions-legales')} className="text-orange-ink underline underline-offset-2">
            mentions légales
          </button>). L&apos;utilisation du service implique l&apos;acceptation pleine et entière des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service et âge minimum">
        <p>
          Bacchana est accessible via le site web bacchana.beloucif.com (PWA) et via les applications Android et
          iOS. Le service est <strong>réservé aux personnes majeures, âgées de 18 ans ou plus</strong>. En
          installant ou en utilisant le service, l&apos;utilisateur déclare et garantit avoir au moins 18 ans.
        </p>
        <p>
          Sur l&apos;App Store, la classification d&apos;âge technique appliquée par Apple est plafonnée à 17+
          (palier maximal du référentiel App Store). Ce plafond propre au système de classification d&apos;Apple
          ne modifie en rien l&apos;exigence de 18 ans fixée par l&apos;éditeur pour l&apos;utilisation effective
          de Bacchana.
        </p>
      </LegalSection>

      <LegalSection title="3. Fonctionnement hors ligne, absence de compte utilisateur">
        <p>
          Bacchana ne nécessite aucune création de compte : l&apos;ensemble des modes de jeu, des packs de
          contenu gratuits et des fonctionnalités de base est accessible directement après installation ou
          première visite, sans identifiant ni mot de passe. Le service fonctionne intégralement hors connexion
          une fois installé : aucune donnée de partie, notamment les prénoms des joueurs saisis pendant une
          partie, n&apos;est transmise à un serveur, quel qu&apos;il soit.
        </p>
        <p>
          L&apos;achat de l&apos;accès premium ou d&apos;un pack à la carte (voir Partie 2, articles 9 et
          suivants) est rattaché à l&apos;appareil ou au moyen de paiement utilisé lors de l&apos;achat. Il peut
          être restauré à tout moment via les mécanismes natifs des plateformes de distribution (App Store,
          Google Play) ou via le reçu d&apos;achat transmis par Stripe pour le web, sans nécessiter la création
          d&apos;un compte Bacchana (voir article 13).
        </p>
      </LegalSection>

      <LegalSection title="4. Comportement de l'utilisateur">
        <p>
          L&apos;utilisateur s&apos;engage à utiliser Bacchana de manière conforme à sa destination : un jeu de
          société numérique destiné à un usage récréatif entre adultes consentants, sans référence à
          l&apos;alcool ni à la consommation de quelque substance que ce soit. Sont notamment interdits :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>toute utilisation détournée visant à inciter à des comportements dangereux pour la santé ou la sécurité des joueurs ;</li>
          <li>toute tentative d&apos;atteinte à l&apos;intégrité technique du service (intrusion, ingénierie inverse à des fins malveillantes, déni de service) ;</li>
          <li>toute reproduction ou redistribution non autorisée des contenus de jeu (packs de cartes, textes, illustrations).</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          Le contenu des packs de jeu, les textes, illustrations, la marque Bacchana et le code source de
          l&apos;application sont protégés par le droit d&apos;auteur et demeurent la propriété exclusive
          d&apos;Adam Beloucif. L&apos;achat de l&apos;accès premium à vie et/ou d&apos;un ou plusieurs packs à
          la carte accorde à l&apos;utilisateur un droit d&apos;usage personnel, non exclusif et{' '}
          <strong>perpétuel</strong> des contenus ainsi acquis, à des fins strictement récréatives et non
          commerciales. Ce droit d&apos;usage n&apos;est assorti d&apos;aucune limite de durée : l&apos;accès est
          acquis de manière définitive lors du paiement unique correspondant.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilité du service">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer un accès continu au service mais ne garantit pas une
          disponibilité ininterrompue. Des interruptions pour maintenance peuvent survenir, avec information
          préalable lorsque possible. Le jeu lui-même restant utilisable hors connexion une fois installé, ces
          éventuelles interruptions concernent principalement les canaux de mise à jour de contenu et
          d&apos;achat, non le fonctionnement du jeu en tant que tel.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          Bacchana est un outil d&apos;animation de soirée conçu pour rester ludique et sans risque : aucune règle
          du jeu ne prescrit, ne suggère ni n&apos;encourage la consommation d&apos;alcool ou de toute autre
          substance, les pénalités du jeu restant volontairement abstraites. L&apos;éditeur ne saurait être tenu
          responsable de l&apos;usage détourné qui serait fait du service, notamment si un groupe de joueurs
          décide, de sa propre initiative et en dehors de toute prescription du jeu, d&apos;associer les
          pénalités à la consommation d&apos;alcool ou à un comportement dangereux pour la santé ou la sécurité
          d&apos;un joueur.
        </p>
      </LegalSection>

      <LegalSection title="8. Cessation d'utilisation">
        <p>
          Aucun compte n&apos;existant, l&apos;utilisateur met fin à son utilisation de Bacchana en désinstallant
          l&apos;application ou en cessant de visiter le site. L&apos;accès premium déjà acheté (accès à vie et
          packs à la carte) reste acquis conformément à l&apos;article 12 et n&apos;est pas affecté par la
          désinstallation : il peut être restauré à tout moment (article 13). L&apos;éditeur se réserve le droit
          de suspendre l&apos;accès d&apos;un utilisateur en cas de manquement grave aux présentes CGU
          (notamment fraude au paiement, contournement technique des mécanismes de protection, ou reproduction
          non autorisée des contenus), sans préjudice des droits légaux du consommateur.
        </p>
      </LegalSection>

      <p className="font-hud text-label uppercase tracking-widest text-ink-muted pt-4">
        Partie 2 - Conditions générales de vente
      </p>

      <LegalSection title="9. Objet et description de l'offre">
        <p>
          Bacchana propose un <strong>accès premium à vie</strong> (paiement unique, achat non consommable),
          donnant un droit d&apos;usage perpétuel à l&apos;ensemble des packs de contenu premium existants et
          futurs inclus dans cette offre, ainsi que des <strong>packs de contenu additionnels à la carte</strong>,
          vendus individuellement en paiement unique. <strong>Il n&apos;existe aucune formule
          d&apos;abonnement</strong>, mensuel, annuel ou de toute autre périodicité, et <strong>aucune période
          d&apos;essai gratuit</strong>. Le prix de chaque offre est affiché avant validation de l&apos;achat, sur
          chaque plateforme de vente (App Store, Google Play, ou paiement web via Stripe).
        </p>
      </LegalSection>

      <LegalSection title="10. Prix et paiement">
        <p>Les prix affichés sont exprimés en euros :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Accès premium à vie : <strong>12,99 euros</strong>, paiement unique.</li>
          <li>Pack de contenu à la carte : <strong>1,99 euro</strong> l&apos;unité, paiement unique.</li>
        </ul>
        <p>
          <strong>Crédit des packs sur l&apos;accès à vie.</strong> Chaque pack de contenu acheté ouvre droit à un
          crédit de <strong>1,99 euro</strong>, déductible du prix de l&apos;accès premium à vie. Ce crédit
          s&apos;applique dans les conditions suivantes :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Le montant du crédit est <strong>fixe et exprimé en valeur absolue</strong> : il reste de 1,99 euro par
            pack acheté, même si le prix de vente des packs venait à évoluer par la suite. Une évolution tarifaire
            ne peut ni réduire ni augmenter un crédit déjà acquis.
          </li>
          <li>
            Le crédit se déduit du prix de l&apos;accès à vie <strong>en vigueur au jour où il est utilisé</strong>.
          </li>
          <li>
            Les crédits acquis se cumulent, dans la limite du prix de l&apos;accès à vie : le montant restant à
            payer ne peut pas être inférieur à <strong>1 euro</strong>, montant minimal facturable. Le cumul des
            crédits ne peut en aucun cas donner lieu à un remboursement, à un versement en espèces ou à un avoir
            utilisable sur un autre achat.
          </li>
          <li>
            Le crédit n&apos;est assorti d&apos;<strong>aucune limite de durée</strong>. Il est attaché aux achats
            de l&apos;utilisateur, qui sont eux-mêmes définitifs et non consommables.
          </li>
          <li>
            Le crédit s&apos;applique aux achats réalisés par le même moyen que le pack d&apos;origine. Les achats
            effectués via l&apos;App Store ou Google Play relèvent des systèmes de facturation d&apos;Apple et de
            Google, qui ne permettent pas de reporter un crédit d&apos;une plateforme à une autre.
          </li>
        </ul>
        <p>
          L&apos;éditeur, personne physique exerçant sous le régime de la micro-entreprise (micro-BNC), bénéficie
          de la franchise en base de TVA prévue à l&apos;article 293 B du Code général des impôts :{' '}
          <strong>la TVA n&apos;est pas applicable</strong> sur les ventes réalisées directement par
          l&apos;éditeur via le site web, ce qui est rappelé par la mention « TVA non applicable, art. 293 B du
          CGI » sur toute facture ou tout reçu émis pour un achat effectué via le web.
        </p>
        <p>
          Pour les achats effectués via l&apos;App Store ou Google Play, le prix affiché et le régime de TVA
          applicable sont déterminés par Apple et Google conformément à leurs propres règles de facturation, ces
          plateformes pouvant agir en tant que revendeurs ou en tant que mandataires de facturation selon les
          juridictions. Le paiement est traité intégralement par le prestataire de la plateforme choisie (Apple,
          Google via RevenueCat, ou Stripe pour le web) - Bacchana ne collecte ni ne stocke aucune donnée de carte
          bancaire.
        </p>
      </LegalSection>

      <LegalSection title="11. Livraison du contenu numérique">
        <p>
          L&apos;accès premium à vie et les packs à la carte sont des contenus numériques fournis sans support
          matériel. Leur exécution, c&apos;est-à-dire le déverrouillage effectif du contenu dans
          l&apos;application, débute <strong>immédiatement</strong> après la confirmation du paiement, sans
          délai d&apos;attente. Cette exécution immédiate constitue le fondement de l&apos;exception au droit de
          rétractation prévue à l&apos;article 14.
        </p>
      </LegalSection>

      <LegalSection title="12. Absence de renouvellement automatique">
        <p>
          L&apos;accès premium à vie et les packs à la carte sont des achats uniques et définitifs.{' '}
          <strong>Aucun renouvellement automatique, aucun abonnement et aucun prélèvement récurrent</strong> ne
          sont associés à ces achats : le prix affiché au moment de l&apos;achat est le seul montant dû, quelle
          que soit la durée d&apos;utilisation ultérieure du service.
        </p>
      </LegalSection>

      <LegalSection title="13. Restauration des achats">
        <p>En l&apos;absence de compte Bacchana, l&apos;accès premium déjà acheté est restauré via les mécanismes suivants :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>App Store</strong> : bouton « Restaurer mes achats » dans l&apos;écran d&apos;achats de l&apos;application, rattaché à l&apos;identifiant Apple utilisé lors de l&apos;achat initial.</li>
          <li><strong>Google Play</strong> : restauration automatique via Google Play Billing, rattachée au compte Google utilisé lors de l&apos;achat initial.</li>
          <li><strong>Web (Stripe)</strong> : le reçu envoyé par Stripe fait foi ; en cas de changement d&apos;appareil, l&apos;utilisateur peut contacter l&apos;éditeur (article 20) pour rétablir l&apos;accès sur présentation du reçu.</li>
        </ul>
        <p>Aucune résiliation n&apos;est nécessaire ni possible, l&apos;achat n&apos;étant pas un abonnement.</p>
      </LegalSection>

      <LegalSection title="14. Droit de rétractation">
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, tout consommateur dispose en
          principe d&apos;un délai de rétractation de 14 jours à compter de la conclusion d&apos;un contrat
          conclu à distance.
        </p>
        <p>
          <strong>Exception applicable au contenu numérique non fourni sur support matériel</strong> (article
          L221-28, 13° du Code de la consommation). Le droit de rétractation ne s&apos;applique pas à la
          fourniture d&apos;un contenu numérique non fourni sur un support matériel dès lors que son exécution a
          commencé après :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>l&apos;accord préalable et exprès du consommateur pour que l&apos;exécution commence avant la fin du délai de rétractation de 14 jours ; et</li>
          <li>la reconnaissance expresse par le consommateur qu&apos;il perd ainsi son droit de rétractation.</li>
        </ul>
        <p>
          Ces deux éléments sont recueillis de manière non équivoque avant la validation du paiement, au moyen de
          cases à cocher dédiées, non pré-cochées, affichées avant la validation du paiement web. Le paiement ne
          peut être validé tant que ce consentement n&apos;a pas été recueilli. La preuve du consentement,
          horodatée et rattachée à la version des présentes conditions en vigueur, est conservée pendant la durée
          de prescription applicable.
        </p>
        <p>
          Pour les achats effectués via l&apos;App Store ou Google Play, les politiques de remboursement propres
          à Apple et Google s&apos;appliquent en complément.
        </p>
      </LegalSection>

      <LegalSection title="15. Garantie légale de conformité du contenu numérique">
        <p>
          Conformément aux articles L224-25-12 et suivants du Code de la consommation, l&apos;éditeur est tenu de
          livrer un contenu numérique conforme au contrat et répond des défauts de conformité existant au moment
          de la livraison, dans les conditions de cette garantie légale spécifique au contenu numérique
          (distincte de la garantie légale de conformité applicable aux biens matériels). En cas de défaut de
          conformité constaté, l&apos;utilisateur peut demander la mise en conformité du contenu ; à défaut, il
          peut obtenir une réduction du prix ou la résolution du contrat, dans les conditions prévues par ces
          articles. Cette garantie s&apos;exerce en s&apos;adressant à l&apos;éditeur (article 20), indépendamment
          des politiques de remboursement propres à l&apos;App Store ou au Google Play Store.
        </p>
      </LegalSection>

      <LegalSection title="16. Médiation de la consommation">
        <p>
          Conformément aux articles L616-1 et R616-1 du Code de la consommation, en cas de litige non résolu avec
          le service client (article 20), le consommateur peut recourir gratuitement à un médiateur de la
          consommation.
        </p>
        <p>
          L&apos;éditeur a adhéré au dispositif de médiation de la consommation <strong>CM2C</strong> (Centre de
          la Médiation de la Consommation de Conciliateurs de Justice), adhésion valide jusqu&apos;au 5 août
          2029. La saisine n&apos;est recevable qu&apos;après une réclamation écrite préalable adressée à
          l&apos;éditeur et restée sans réponse satisfaisante.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>CM2C</strong> - 49 rue de Ponthieu, 75008 Paris</li>
          <li>Téléphone : 01 89 47 00 14</li>
          <li>Site de saisine : cm2c.net/declarer-un-litige.php</li>
          <li>Courriel : litiges@cm2c.net</li>
        </ul>
        <p>
          Le recours au médiateur est gratuit pour le consommateur. Le consommateur peut également recourir à la
          plateforme européenne de règlement en ligne des litiges (RLL) : ec.europa.eu/consumers/odr.
        </p>
      </LegalSection>

      <LegalSection title="17. Facturation">
        <p>
          Une facture ou un reçu conforme est émis pour chaque transaction. Pour les achats effectués via le site
          web (Stripe), la facture porte les mentions obligatoires prévues par l&apos;article 242 nonies A du
          Code général des impôts, ainsi que la mention « TVA non applicable, art. 293 B du CGI » en raison de la
          franchise en base de TVA de l&apos;éditeur. Pour les achats effectués via l&apos;App Store ou Google
          Play, le reçu est émis directement par Apple ou Google conformément à leurs propres obligations de
          facturation.
        </p>
      </LegalSection>

      <LegalSection title="18. Modification des CGU/CGV">
        <p>
          Les présentes conditions peuvent être modifiées pour refléter une évolution du service, de l&apos;offre
          tarifaire ou de la réglementation. Toute modification substantielle fait l&apos;objet d&apos;une
          information dans l&apos;application avant son entrée en vigueur.
        </p>
      </LegalSection>

      <LegalSection title="19. Droit applicable et juridiction">
        <p>
          Les présentes CGU/CGV sont soumises au droit français. Pour les consommateurs, les règles impératives de
          protection du consommateur de leur pays de résidence dans l&apos;Union européenne, lorsqu&apos;elles sont
          plus favorables, demeurent applicables.
        </p>
      </LegalSection>

      <LegalSection title="20. Contact">
        <p>Pour toute question relative aux présentes CGU/CGV : adambeloucif@gmail.com</p>
      </LegalSection>
    </LegalLayout>
  )
}
