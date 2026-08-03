import { LegalLayout, LegalSection, LegalTable, LegalReviewNote } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * Politique de confidentialite - transcription de la-taverne-content/legal/politique-confidentialite.md.
 * [ADRESSE] -> "adresse communiquee sur demande legitime", [DATE] -> "1er aout 2026".
 */
export function ConfidentialiteScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="Politique de confidentialité" version="Version applicable au 1er août 2026">
      <LegalSection title="1. Responsable de traitement">
        <p>
          <strong>Adam Beloucif, exercant sous le nom commercial BLF Labs</strong>, entreprise individuelle exploitée par Adam Beloucif, éditrice de
          La Taverne, adresse communiquée sur demande légitime,
          contact : adambeloucif@gmail.com, est responsable du traitement des données personnelles collectées dans
          le cadre du service La Taverne au sens de l&apos;article 4.7 du RGPD.
        </p>
        <p>
          Aucun délégué à la protection des données (DPO) n&apos;est désigné à ce jour : le volume et la sensibilité
          des traitements ne rendent pas cette désignation obligatoire au sens de l&apos;article 37 du RGPD. Ce
          point est réévalué si le service grandit significativement.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées et bases légales">
        <LegalTable
          headers={['Donnée', 'Finalité', 'Base légale', 'Conservation']}
          rows={[
            ['Adresse email', 'Création et gestion du compte (OTP ou Google/Apple)', 'Exécution du contrat (art. 6.1.b)', 'Durée de vie du compte + 3 ans après dernière connexion'],
            ['Identifiant technique (UID Supabase)', 'Fonctionnement technique du service', 'Exécution du contrat', 'Durée de vie du compte'],
            ['Pseudonymes des joueurs en partie', 'Affichage du nom des joueurs pendant une partie locale', 'Intérêt légitime', 'Stockage local uniquement (localStorage), jamais transmis aux serveurs'],
            ['Données d’abonnement (statut, renouvellement, plateforme)', 'Gestion de l’abonnement La Taverne Premium', 'Exécution du contrat', '10 ans (pièces comptables)'],
            ['Données de transaction (montant, devise, méthode tokenisée)', 'Facturation de l’abonnement', 'Exécution du contrat', 'Géré par RevenueCat/Stripe - aucune donnée carte stockée par La Taverne'],
            ['Événements d’usage (pages vues, actions anonymisées, type d’appareil)', 'Mesure d’audience et amélioration produit', 'Consentement préalable (art. 6.1.a)', '13 mois maximum'],
            ['Adresse IP', 'Sécurité, anti-fraude, géolocalisation approximative', 'Intérêt légitime', 'Non conservée en clair au-delà de la session, tronquée/anonymisée côté PostHog'],
          ]}
        />
        <p>
          <strong>Aucune collecte de donnée de santé, biométrique, ou relative à la vie sexuelle, aux opinions
          politiques ou religieuses.</strong> La Taverne n&apos;est pas destiné aux mineurs (voir section 9).
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
            ['Supabase Inc.', 'Authentification, base de données applicative', 'Union européenne'],
            ['RevenueCat Inc.', 'Gestion des abonnements, réconciliation des achats', 'États-Unis (clauses contractuelles types)'],
            ['Stripe Payments Europe Ltd.', 'Paiement par carte bancaire (abonnement web)', 'Union européenne (Irlande) + traitement complémentaire aux États-Unis'],
            ['PostHog (EU Cloud)', 'Mesure d’audience, analytics produit', 'Union européenne (Allemagne)'],
            ['Vercel Inc.', 'Hébergement de l’application web (PWA)', 'États-Unis + réseau de diffusion mondial'],
            ['Google Ireland Ltd. / Google LLC', 'Authentification OAuth, distribution Play Store', 'Union européenne / États-Unis'],
            ['Apple Distribution International', 'Authentification, distribution App Store', 'Union européenne (Irlande) / États-Unis'],
          ]}
        />
        <p>
          <strong>Aucune donnée n&apos;est vendue à des tiers.</strong> Aucun partage à des fins publicitaires
          n&apos;est effectué.
        </p>
      </LegalSection>

      <LegalSection title="4. Transferts de données hors Union européenne">
        <p>
          Certains sous-traitants (RevenueCat, une partie de l&apos;infrastructure Vercel et Stripe) sont basés aux
          États-Unis ou y traitent des données de manière complémentaire. Ces transferts sont encadrés par les
          clauses contractuelles types de la Commission européenne (décision d&apos;exécution 2021/914) et/ou par la
          certification du sous-traitant au EU-US Data Privacy Framework lorsque applicable.
        </p>
      </LegalSection>

      <LegalSection title="5. Durées de conservation - synthèse">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Compte actif</strong> : conservation pendant toute la durée d&apos;utilisation.</li>
          <li><strong>Compte inactif</strong> : suppression ou anonymisation après 3 ans sans connexion.</li>
          <li><strong>Compte supprimé</strong> : suppression sous 30 jours, sauf obligation légale (facturation : 10 ans).</li>
          <li><strong>Données analytics</strong> : 13 mois maximum.</li>
          <li><strong>Pseudonymes de partie</strong> : jamais transmis aux serveurs, aucune conservation.</li>
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
          <strong>Pour exercer ces droits</strong> : écrire à adambeloucif@gmail.com. Réponse sous un délai maximal
          d&apos;un mois (prolongeable de deux mois pour les demandes complexes).
        </p>
        <p>
          <strong>Réclamation</strong> : en cas de désaccord persistant, chaque utilisateur peut saisir la
          Commission nationale de l&apos;informatique et des libertés (CNIL) - www.cnil.fr, 3 place de Fontenoy,
          TSA 80715, 75334 Paris Cedex 07.
        </p>
      </LegalSection>

      <LegalSection title="7. Suppression de compte">
        <p>
          La suppression de compte est disponible directement depuis l&apos;application (Réglages &gt; Compte &gt;
          Supprimer mon compte). La suppression entraîne l&apos;effacement des données personnelles associées sous
          30 jours, hors obligations légales de conservation (facturation).
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies et traceurs">
        <p>Le site web et l&apos;application La Taverne utilisent :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Traceurs strictement nécessaires</strong> (session d&apos;authentification Supabase) : exempts
            de consentement, basés sur l&apos;intérêt légitime au fonctionnement du service.
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
          La Taverne est un jeu destiné à un public adulte (17+/18+ selon les classifications des stores). Le service
          n&apos;est pas destiné aux mineurs et aucune collecte n&apos;est sciemment effectuée auprès de personnes
          de moins de 18 ans. Si La Taverne prend connaissance d&apos;une inscription par un mineur, le compte
          concerné est supprimé.
        </p>
      </LegalSection>

      <LegalSection title="10. Sécurité des données">
        <p>
          Chiffrement des données en transit (TLS), authentification gérée par Supabase Auth (OTP email, OAuth),
          politiques d&apos;accès par ligne (Row Level Security) sur la base Supabase, aucun stockage de donnée de
          carte bancaire côté La Taverne (délégué intégralement à Stripe, Apple et Google), journalisation limitée et
          accès restreint aux seules personnes habilitées.
        </p>
      </LegalSection>

      <LegalSection title="11. Modification de la politique de confidentialité">
        <p>
          Cette politique peut être mise à jour pour refléter une évolution du service, des sous-traitants ou de la
          réglementation. La date de dernière mise à jour figure en tête de document. Toute modification
          substantielle fait l&apos;objet d&apos;une information dans l&apos;application.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Pour toute question relative à cette politique ou à l&apos;exercice des droits RGPD :
          adambeloucif@gmail.com. Voir aussi les{' '}
          <button onClick={() => navigateTo('mentions-legales')} className="text-orange-ink underline underline-offset-2">
            mentions légales
          </button>{' '}
          et les{' '}
          <button onClick={() => navigateTo('cgu')} className="text-orange-ink underline underline-offset-2">
            CGU/CGV
          </button>.
        </p>
        <LegalReviewNote>
          DPA à archiver avec chaque sous-traitant avant mise en production complète (Supabase, RevenueCat, Stripe,
          PostHog, Vercel).
        </LegalReviewNote>
      </LegalSection>
    </LegalLayout>
  )
}
