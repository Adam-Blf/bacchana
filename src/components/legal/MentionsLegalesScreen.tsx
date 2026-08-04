import { LegalLayout, LegalSection, LegalTable, LegalReviewNote } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * Mentions legales - transcription de la-taverne-content/legal/mentions-legales.md.
 * [ADRESSE] -> "adresse communiquee sur demande legitime", [DATE] -> "1er aout 2026".
 */
export function MentionsLegalesScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="Mentions légales" version="Version applicable au 1er août 2026">
      <LegalSection title="1. Éditeur du site et des applications">
        <p>Le site lataverne.beloucif.com et les applications Meskova sont édités par :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Dénomination</strong> : Adam Beloucif, exercant sous le nom commercial BLF Labs</li>
          <li><strong>Forme</strong> : entreprise individuelle (micro-entreprise), exploitée par Adam Beloucif</li>
          <li><strong>Adresse</strong> : adresse communiquée sur demande légitime</li>
          <li><strong>Contact</strong> : adambeloucif@gmail.com</li>
          <li><strong>Directeur de la publication</strong> : Adam Beloucif</li>
          <li><strong>SIREN / SIRET</strong> : immatriculation en cours au Registre National des Entreprises</li>
        </ul>
        <LegalReviewNote>
          L&apos;éditeur exerçant une activité commerciale, l&apos;article 6-III-1 de la LCEN impose la
          publication de son adresse et de son numéro de téléphone : l&apos;exemption de l&apos;article 6-III-2,
          réservée aux éditeurs non professionnels, ne s&apos;applique pas. Adresse à publier dès
          l&apos;immatriculation, soit celle du siège, soit celle d&apos;une domiciliation commerciale.
        </LegalReviewNote>
      </LegalSection>

      <LegalSection title="2. Activité commerciale">
        <p>
          Meskova propose un abonnement premium payant (« Meskova Premium »). Dès lors qu&apos;une activité
          commerciale est exercée à titre habituel, une immatriculation (micro-entreprise ou autre statut) est
          requise auprès de l&apos;URSSAF/INPI, avec obtention d&apos;un numéro SIRET.
        </p>
        <LegalReviewNote>
          Immatriculation d&apos;Adam Beloucif, exercant sous le nom commercial BLF Labs en cours auprès du guichet unique INPI - le SIRET reste
          bloquant avant activation des paiements en production.
        </LegalReviewNote>
      </LegalSection>

      <LegalSection title="3. Informations commerçant (règlement européen sur les services numériques)">
        <p>
          Conformément au règlement (UE) 2022/2065 sur les services numériques, Adam Beloucif, exercant sous le nom commercial BLF Labs est
          identifiée comme commerçant auprès des plateformes de distribution (App Store, Google Play) :
          dénomination Adam Beloucif, exercant sous le nom commercial BLF Labs, contact adambeloucif@gmail.com, SIRET communiqué dès
          immatriculation. Ces informations sont consultables depuis la fiche de l&apos;application sur
          chaque plateforme.
        </p>
      </LegalSection>

      <LegalSection title="4. Hébergement du site web (PWA)">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Hébergeur</strong> : Vercel Inc.</li>
          <li><strong>Adresse</strong> : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
          <li><strong>Site</strong> : vercel.com</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Hébergement des données applicatives">
        <p>
          <strong>Prestataire</strong> : Supabase Inc. (infrastructure exploitée sur des serveurs situés dans
          l&apos;Union européenne). <strong>Site</strong> : supabase.com.
        </p>
      </LegalSection>

      <LegalSection title="6. Prestataires techniques additionnels">
        <p>Détail complet dans la politique de confidentialité.</p>
        <LegalTable
          headers={['Service', 'Fonction', 'Prestataire']}
          rows={[
            ['Paiement / abonnement', 'Gestion des abonnements et achats in-app', 'RevenueCat Inc. (+ Stripe pour le web)'],
            ['Mesure d’audience', 'Analytics produit (instance EU)', 'PostHog (EU Cloud)'],
            ['Distribution mobile', 'Boutiques d’applications', 'Google Ireland Ltd. (Play Store), Apple Distribution International (App Store)'],
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site et des applications Meskova (charte graphique, textes, contenus de
          jeu, packs de cartes, code source, logo) est la propriété exclusive d&apos;Adam Beloucif, exercant sous le nom commercial BLF Labs, sauf mention
          contraire. Toute reproduction, représentation, modification ou exploitation totale ou partielle de ces
          éléments, sans autorisation expresse, est interdite et constitutive d&apos;une contrefaçon au sens des
          articles L.335-2 et suivants du Code de la propriété intellectuelle.
        </p>
      </LegalSection>

      <LegalSection title="8. Données personnelles">
        <p>
          Le traitement des données personnelles des utilisateurs est détaillé dans la{' '}
          <button onClick={() => navigateTo('confidentialite')} className="text-orange-ink underline underline-offset-2">
            politique de confidentialité
          </button>.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies et traceurs">
        <p>
          L&apos;usage de cookies et traceurs est détaillé dans la{' '}
          <button onClick={() => navigateTo('confidentialite')} className="text-orange-ink underline underline-offset-2">
            politique de confidentialité
          </button>, avec un consentement recueilli via le bandeau accessible à tout moment depuis le pied de page.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation de responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations
          diffusées sur le site et les applications, mais ne peut garantir l&apos;absence totale d&apos;erreur ou
          d&apos;interruption de service. L&apos;utilisateur reste seul responsable de l&apos;usage qu&apos;il fait
          du service, notamment dans le cadre d&apos;activités sociales impliquant plusieurs joueurs.
        </p>
      </LegalSection>

      <LegalSection title="11. Droit applicable et litiges">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de
          résolution amiable, les tribunaux français compétents seront seuls saisis, sous réserve des dispositions
          impératives applicables aux consommateurs.
        </p>
      </LegalSection>

      <LegalSection title="12. Crédits et ressources tierces">
        <p>
          Les pictogrammes des jeux proviennent d&apos;
          <a href="https://icons8.com" target="_blank" rel="noreferrer" className="text-orange-ink underline">
            Icons8
          </a>
          {' '}(style Hatch), utilisés au titre de la licence gratuite avec attribution. Les polices
          Anton, Bricolage Grotesque et Space Mono sont distribuées sous licence SIL Open Font.
          Tous les contenus de jeu sont des créations originales de Meskova.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>Pour toute question relative aux présentes mentions légales : adambeloucif@gmail.com</p>
      </LegalSection>
    </LegalLayout>
  )
}
