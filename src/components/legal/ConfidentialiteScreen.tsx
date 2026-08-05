import { LegalLayout, LegalSection, LegalTable, LegalReviewNote } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * Politique de confidentialite - transcription de la-taverne-content/legal/politique-confidentialite.md (v1.14.0).
 * Modele produit sans compte utilisateur : seules les donnees de paiement (achat premium a vie / pack a la
 * carte) et, si consentement, les donnees analytics sont traitees. [ADRESSE] -> "adresse communiquee sur
 * demande legitime".
 */
export function ConfidentialiteScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="Politique de confidentialité" version="Version applicable au 4 août 2026">
      <LegalSection title="1. Responsable de traitement">
        <p>
          <strong>Adam Beloucif, exercant sous le nom commercial BLF Lab&apos;s</strong>, entreprise individuelle
          exploitée par Adam Beloucif, éditrice de La Tournée, adresse communiquée sur demande légitime,
          contact : adam@beloucif.com, est responsable du traitement des données personnelles collectées dans
          le cadre du service La Tournée au sens de l&apos;article 4.7 du RGPD.
        </p>
        <p>
          Aucun délégué à la protection des données (DPO) n&apos;est désigné à ce jour : le volume et la
          sensibilité des traitements, très limités (voir article 2), ne rendent pas cette désignation
          obligatoire au sens de l&apos;article 37 du RGPD. Ce point est réévalué si le service grandit
          significativement.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées et bases légales">
        <p>
          La Tournée fonctionne <strong>sans création de compte</strong> : aucun identifiant, aucun mot de passe et
          aucune adresse email ne sont demandés pour utiliser le jeu. Les seules données traitées sont celles
          strictement nécessaires au paiement de l&apos;accès premium ou d&apos;un pack à la carte et, si
          l&apos;utilisateur y consent, à la mesure d&apos;audience.
        </p>
        <LegalTable
          headers={['Donnée', 'Finalité', 'Base légale', 'Conservation']}
          rows={[
            ['Prénoms des joueurs saisis en partie', 'Affichage du nom des joueurs pendant une partie locale', 'Traitement réalisé intégralement sur l’appareil, hors du champ des serveurs de l’éditeur', 'Stockage local uniquement (localStorage), jamais transmis aux serveurs'],
            ['Email et données de transaction (achat web via Stripe)', 'Paiement, envoi du reçu, facturation de l’accès premium ou d’un pack', 'Exécution du contrat (art. 6.1.b)', '10 ans (pièces comptables, art. L123-22 du Code de commerce)'],
            ['Identifiant d’achat et statut d’entitlement (mobile, via RevenueCat)', 'Vérification et restauration de l’accès premium acheté via l’App Store ou Google Play', 'Exécution du contrat (art. 6.1.b)', 'Durée de vie de l’entitlement, gérée par RevenueCat et les plateformes'],
            ['Événements d’usage (pages vues, actions anonymisées, type d’appareil)', 'Mesure d’audience et amélioration produit', 'Consentement préalable (art. 6.1.a)', '13 mois maximum'],
            ['Adresse IP', 'Sécurité, fonctionnement technique, mesure d’audience si consentie', 'Intérêt légitime / Consentement selon la finalité', 'Non conservée en clair au-delà de la session, tronquée/anonymisée côté PostHog'],
          ]}
        />
        <p>
          <strong>Aucune collecte de donnée de santé, biométrique, ou relative à la vie sexuelle, aux opinions
          politiques ou religieuses.</strong> La Tournée n&apos;est pas destiné aux mineurs (voir section 9) et ne
          collecte aucune donnée au moyen d&apos;un compte utilisateur, faute de système de compte.
        </p>
      </LegalSection>

      <LegalSection title="3. Sous-traitants et destinataires des données">
        <p>
          Conformément à l&apos;article 28 du RGPD, chaque sous-traitant traite les données sous instruction du
          responsable de traitement, dans le cadre d&apos;un accord de traitement des données (DPA).
        </p>
        <LegalTable
          headers={['Sous-traitant', 'Fonction', 'Localisation']}
          rows={[
            ['Stripe Payments Europe Ltd.', 'Paiement par carte bancaire (accès premium et packs, web)', 'Union européenne (Irlande) + traitement complémentaire aux États-Unis'],
            ['RevenueCat Inc.', 'Vérification et restauration des achats in-app', 'États-Unis (clauses contractuelles types)'],
            ['PostHog (EU Cloud)', 'Mesure d’audience, analytics produit', 'Union européenne (Allemagne)'],
            ['Vercel Inc.', 'Hébergement de l’application web (PWA)', 'États-Unis + réseau de diffusion mondial'],
            ['Google Ireland Ltd. / Google LLC', 'Distribution Play Store, facturation Play Billing', 'Union européenne / États-Unis'],
            ['Apple Distribution International', 'Distribution App Store, facturation StoreKit', 'Union européenne (Irlande) / États-Unis'],
          ]}
        />
        <p>
          Un <strong>prestataire tiers</strong> est envisagé dans l&apos;architecture cible pour une éventuelle distribution
          future de contenus premium, mais n&apos;est <strong>pas connecté</strong> au service en production à la
          date de la présente version : aucune donnée n&apos;y transite.
        </p>
        <p>
          <strong>Aucune donnée n&apos;est vendue à des tiers.</strong> Aucun partage à des fins publicitaires
          n&apos;est effectué.
        </p>
        <LegalReviewNote>
          DPA à archiver avec chaque sous-traitant traitant des données personnelles (Stripe, RevenueCat,
          PostHog, Vercel disposent tous de DPA standards accessibles depuis leur back-office ou site légal - à
          télécharger et archiver avant mise en production complète).
        </LegalReviewNote>
      </LegalSection>

      <LegalSection title="4. Transferts de données hors Union européenne">
        <p>
          Certains sous-traitants (RevenueCat, une partie de l&apos;infrastructure Vercel et de Stripe) sont
          basés aux États-Unis ou y traitent des données de manière complémentaire. Ces transferts sont encadrés
          par les clauses contractuelles types de la Commission européenne (décision d&apos;exécution 2021/914)
          et/ou par la certification du sous-traitant au EU-US Data Privacy Framework lorsque applicable.
        </p>
      </LegalSection>

      <LegalSection title="5. Durées de conservation - synthèse">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Données de partie (prénoms des joueurs)</strong> : jamais transmises aux serveurs de l&apos;éditeur, donc aucune conservation côté La Tournée.</li>
          <li><strong>Données de transaction (achat web)</strong> : durée de la relation contractuelle + 10 ans à des fins comptables, gérée par Stripe.</li>
          <li><strong>Données d&apos;entitlement (achat mobile)</strong> : durée de vie de l&apos;entitlement, gérée par RevenueCat, Apple et Google.</li>
          <li><strong>Données analytics</strong> : 13 mois maximum, uniquement si consentement donné.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Droits des personnes concernées">
        <p>Conformément aux articles 15 à 22 du RGPD, chaque utilisateur dispose des droits suivants :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Droit d&apos;accès</li>
          <li>Droit de rectification</li>
          <li>Droit à l&apos;effacement</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d&apos;opposition</li>
          <li>Droit de retirer son consentement à tout moment (analytics), sans affecter la licéité des traitements antérieurs</li>
          <li>Droit de définir des directives relatives au sort des données après le décès</li>
        </ul>
        <p>
          <strong>Pour exercer ces droits</strong> : écrire à adam@beloucif.com. Réponse sous un délai maximal
          d&apos;un mois (prolongeable de deux mois pour les demandes complexes).
        </p>
        <p>
          <strong>Réclamation</strong> : en cas de désaccord persistant, chaque utilisateur peut saisir la
          Commission nationale de l&apos;informatique et des libertés (CNIL) - www.cnil.fr, 3 place de Fontenoy,
          TSA 80715, 75334 Paris Cedex 07.
        </p>
      </LegalSection>

      <LegalSection title="7. Effacement des données et désinstallation">
        <p>
          La Tournée ne proposant <strong>pas de compte utilisateur</strong>, il n&apos;existe pas de fonctionnalité
          de suppression de compte à proprement parler. L&apos;utilisateur maîtrise directement les données
          stockées localement sur son appareil (prénoms de partie, préférences) : elles sont effacées par la
          désinstallation de l&apos;application ou par la fonction de réinitialisation disponible dans les
          réglages, sans intervention de l&apos;éditeur.
        </p>
        <p>
          Pour toute demande relative aux données de facturation conservées par l&apos;éditeur ou ses
          sous-traitants (Stripe, RevenueCat, Apple, Google), l&apos;utilisateur peut exercer ses droits
          conformément à l&apos;article 6, dans les limites des obligations légales de conservation comptable.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies et traceurs">
        <p>Le site web et l&apos;application La Tournée utilisent :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Stockage local strictement nécessaire</strong> (état de partie en cours, préférences
            d&apos;affichage, choix de consentement exprimé) : exempt de consentement, purement fonctionnel,
            exécuté uniquement sur l&apos;appareil de l&apos;utilisateur et non transmis à un tiers.
          </li>
          <li>
            <strong>Traceurs de mesure d&apos;audience</strong> (PostHog, instance EU) : soumis à consentement
            préalable, recueilli via le bandeau de cookies. Le refus est aussi simple que l&apos;acceptation et
            modifiable à tout moment depuis le pied de page.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Public concerné et mineurs">
        <p>
          La Tournée est un jeu destiné à un public adulte, <strong>réservé aux personnes de 18 ans ou plus</strong>.
          La classification d&apos;âge technique d&apos;Apple, plafonnée à 17+ (palier maximal de son
          référentiel), n&apos;abaisse pas cette exigence propre à La Tournée. Le service n&apos;est pas destiné aux
          mineurs et aucune collecte n&apos;est sciemment effectuée auprès de personnes de moins de 18 ans.
        </p>
      </LegalSection>

      <LegalSection title="10. Sécurité des données">
        <p>
          Chiffrement des flux de paiement en transit (TLS, délégué intégralement à Stripe, Apple et Google),
          aucun stockage de donnée de carte bancaire côté La Tournée, stockage des données de partie exclusivement
          local sur l&apos;appareil de l&apos;utilisateur (sous son contrôle exclusif, hors de la portée de
          l&apos;éditeur), accès aux données de facturation restreint aux seules personnes habilitées.
        </p>
      </LegalSection>

      <LegalSection title="11. Modification de la politique de confidentialité">
        <p>
          Cette politique peut être mise à jour pour refléter une évolution du service, des sous-traitants ou de la
          réglementation, notamment en cas d&apos;activation future d&apos;un prestataire tiers. La date de dernière mise à jour
          figure en tête de document. Toute modification substantielle fait l&apos;objet d&apos;une information
          dans l&apos;application.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Pour toute question relative à cette politique ou à l&apos;exercice des droits RGPD :
          adam@beloucif.com. Voir aussi les{' '}
          <button onClick={() => navigateTo('mentions-legales')} className="text-orange-ink underline underline-offset-2">
            mentions légales
          </button>{' '}
          et les{' '}
          <button onClick={() => navigateTo('cgu')} className="text-orange-ink underline underline-offset-2">
            CGU/CGV
          </button>.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
