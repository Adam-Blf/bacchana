import { LegalLayout, LegalSection, LegalReviewNote } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * CGU/CGV - transcription de la-taverne-content/legal/cgu-cgv.md.
 * [ADRESSE] -> "adresse communiquee sur demande legitime", [DATE] -> "1er aout 2026".
 */
export function CguScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="CGU / CGV" version="Version applicable au 1er août 2026">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Partie 1 - Conditions générales d&apos;utilisation
      </p>

      <LegalSection title="1. Objet">
        <p>
          Les présentes CGU régissent l&apos;accès et l&apos;utilisation du service La Taverne, jeu de société
          numérique de soirée, édité par Adam Beloucif (voir{' '}
          <button onClick={() => navigateTo('mentions-legales')} className="text-neon underline underline-offset-2">
            mentions légales
          </button>). L&apos;utilisation du service implique l&apos;acceptation pleine et entière des présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service">
        <p>
          La Taverne est accessible via le site web lataverne.beloucif.com (PWA) et via les applications Android et
          iOS. Le service est réservé aux personnes majeures ou disposant de la capacité juridique requise dans
          leur pays de résidence, avec un minimum de 17 ans (App Store) ou 18 ans (Google Play, Web) selon la
          plateforme d&apos;accès.
        </p>
      </LegalSection>

      <LegalSection title="3. Création de compte">
        <p>
          L&apos;accès aux fonctionnalités nécessitant un compte (sauvegarde de progression, abonnement premium)
          requiert une inscription par adresse email (code à usage unique) ou via un fournisseur d&apos;authentification
          tiers (Google, Apple). L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir
          la confidentialité de ses identifiants de connexion.
        </p>
      </LegalSection>

      <LegalSection title="4. Comportement de l'utilisateur">
        <p>
          L&apos;utilisateur s&apos;engage à utiliser La Taverne de manière conforme à sa destination : un jeu de
          société numérique destiné à un usage récréatif entre adultes consentants. Sont notamment interdits :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>toute utilisation détournée visant à inciter à des comportements dangereux pour la santé ou la sécurité des joueurs ;</li>
          <li>toute tentative d&apos;atteinte à l&apos;intégrité technique du service (intrusion, ingénierie inverse à des fins malveillantes, déni de service) ;</li>
          <li>toute reproduction ou redistribution non autorisée des contenus de jeu (packs de cartes, textes, illustrations).</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          Le contenu des packs de jeu, les textes, illustrations, la marque La Taverne et le code source de
          l&apos;application sont protégés par le droit d&apos;auteur et demeurent la propriété exclusive d&apos;Adam
          Beloucif. L&apos;abonnement premium accorde à l&apos;utilisateur un droit d&apos;usage personnel et non
          exclusif des contenus premium, pour la durée de l&apos;abonnement, à des fins strictement récréatives et
          non commerciales.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilité du service">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer un accès continu au service mais ne garantit pas une
          disponibilité ininterrompue. Des interruptions pour maintenance peuvent survenir, avec information
          préalable lorsque possible.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          La Taverne est un outil d&apos;animation de soirée ; l&apos;éditeur ne saurait être tenu responsable de
          l&apos;usage qui en est fait par les utilisateurs, notamment en cas de non-respect des règles de bonne
          conduite entre joueurs.
        </p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>
          L&apos;utilisateur peut supprimer son compte à tout moment depuis l&apos;application. L&apos;éditeur se
          réserve le droit de suspendre ou résilier l&apos;accès d&apos;un utilisateur en cas de manquement grave
          aux présentes CGU.
        </p>
      </LegalSection>

      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted pt-4">
        Partie 2 - Conditions générales de vente - abonnement La Taverne Premium
      </p>

      <LegalSection title="9. Objet et description de l'offre">
        <p>
          La Taverne propose un abonnement premium optionnel, « La Taverne Premium », donnant accès à des packs de contenu
          additionnels. L&apos;abonnement est proposé en formule mensuelle et en formule annuelle. Les prix, en
          euros TTC (TVA française applicable incluse), sont affichés avant validation de l&apos;achat, sur chaque
          plateforme de vente (App Store, Google Play, ou paiement web via Stripe).
        </p>
      </LegalSection>

      <LegalSection title="10. Prix et paiement">
        <p>
          Les prix affichés sont exprimés TTC. Le prix peut varier selon la plateforme d&apos;achat en raison des
          commissions et régimes de TVA propres à chaque plateforme. Le paiement est traité intégralement par le
          prestataire de la plateforme choisie (Apple, Google, ou Stripe pour le web) - La Taverne ne collecte ni ne
          stocke aucune donnée de carte bancaire.
        </p>
      </LegalSection>

      <LegalSection title="11. Renouvellement automatique">
        <p>
          L&apos;abonnement La Taverne Premium se renouvelle automatiquement à échéance (mensuelle ou annuelle selon la
          formule choisie), sauf résiliation par l&apos;utilisateur au moins 24 heures avant la date de
          renouvellement. Le prix du renouvellement est identique au prix en vigueur au moment de la souscription,
          sauf modification tarifaire notifiée préalablement.
        </p>
      </LegalSection>

      <LegalSection title="12. Résiliation de l'abonnement">
        <p>La résiliation s&apos;effectue directement depuis les réglages de l&apos;abonnement sur la plateforme d&apos;achat concernée :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>App Store</strong> : Réglages iOS &gt; [Nom] &gt; Abonnements.</li>
          <li><strong>Google Play</strong> : Play Store &gt; Menu &gt; Paiements et abonnements &gt; Abonnements.</li>
          <li><strong>Web (Stripe)</strong> : depuis l&apos;espace compte de l&apos;application La Taverne.</li>
        </ul>
        <p>
          La résiliation prend effet à la fin de la période en cours ; aucun remboursement au prorata n&apos;est
          effectué pour la période déjà entamée, sauf disposition légale contraire.
        </p>
      </LegalSection>

      <LegalSection title="13. Droit de rétractation">
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, tout consommateur dispose d&apos;un
          délai de rétractation de 14 jours à compter de la souscription d&apos;un contrat conclu à distance.
        </p>
        <p>
          <strong>Exception applicable au contenu numérique</strong> (art. L221-28, 13° du Code de la
          consommation) : le droit de rétractation ne s&apos;applique pas à la fourniture d&apos;un contenu
          numérique non fourni sur un support matériel dont l&apos;exécution a commencé après accord préalable
          exprès du consommateur et renoncement exprès à son droit de rétractation. L&apos;accès immédiat aux packs
          de contenu premium dès la souscription constitue une telle exécution immédiate : en validant son achat,
          l&apos;utilisateur reconnaît renoncer expressément à son droit de rétractation pour ce contenu numérique.
        </p>
        <p>
          Pour les achats effectués via l&apos;App Store ou Google Play, les politiques de remboursement propres à
          Apple et Google s&apos;appliquent en complément.
        </p>
      </LegalSection>

      <LegalSection title="14. Médiation de la consommation">
        <p>
          Conformément aux articles L616-1 et R616-1 du Code de la consommation, en cas de litige non résolu avec
          le service client (adambeloucif@gmail.com), le consommateur peut recourir gratuitement à un médiateur de
          la consommation. Le consommateur peut également recourir à la plateforme européenne de règlement en ligne
          des litiges (RLL) : ec.europa.eu/consumers/odr.
        </p>
        <LegalReviewNote>
          Médiateur de la consommation à désigner avant activation des paiements en production (liste des
          médiateurs agréés CECMC).
        </LegalReviewNote>
      </LegalSection>

      <LegalSection title="15. Facturation">
        <p>
          Une facture ou un reçu conforme est émis pour chaque transaction par le prestataire de paiement concerné
          (Apple, Google, ou Stripe pour le web), mentionnant les éléments requis par l&apos;article 242 nonies A du
          Code général des impôts.
        </p>
      </LegalSection>

      <LegalSection title="16. Modification des CGU/CGV">
        <p>
          Les présentes conditions peuvent être modifiées pour refléter une évolution du service, de l&apos;offre
          tarifaire ou de la réglementation. Toute modification substantielle fait l&apos;objet d&apos;une
          information dans l&apos;application avant son entrée en vigueur.
        </p>
      </LegalSection>

      <LegalSection title="17. Droit applicable et juridiction">
        <p>
          Les présentes CGU/CGV sont soumises au droit français. Pour les consommateurs, les règles impératives de
          protection du consommateur de leur pays de résidence dans l&apos;Union européenne, lorsqu&apos;elles sont
          plus favorables, demeurent applicables.
        </p>
      </LegalSection>

      <LegalSection title="18. Contact">
        <p>Pour toute question relative aux présentes CGU/CGV : adambeloucif@gmail.com</p>
      </LegalSection>
    </LegalLayout>
  )
}
