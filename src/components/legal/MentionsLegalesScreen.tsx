import { LegalLayout, LegalSection, LegalTable } from './LegalLayout'
import { useAppStore } from '@/stores'

/**
 * Mentions legales - transcription de la-taverne-content/legal/mentions-legales.md (v1.14.0).
 * Immatriculation validee le 4 aout 2026 (SIREN 108386855, SIRET 10838685500010).
 */
export function MentionsLegalesScreen() {
  const { navigateTo } = useAppStore()

  return (
    <LegalLayout title="Mentions légales" version="Version applicable au 4 août 2026">
      <LegalSection title="1. Éditeur du site et des applications">
        <p>Le site lataverne.beloucif.com et les applications Meskova sont édités par :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Nom</strong> : Adam Beloucif, exercant sous le nom commercial BLF Lab&apos;s</li>
          <li><strong>Statut</strong> : personne physique, entrepreneur individuel sous le régime de la micro-entreprise</li>
          <li><strong>Adresse</strong> : 6 impasse Édouard Vaillant, 94550 Chevilly-Larue, France</li>
          <li><strong>SIREN</strong> : 108386855</li>
          <li><strong>SIRET</strong> : 10838685500010</li>
          <li><strong>Code APE</strong> : 6201Z (Activités de programmation informatique)</li>
          <li><strong>Régime fiscal</strong> : micro-BNC, franchise en base de TVA (article 293 B du Code général des impôts) - TVA non applicable sur les ventes réalisées directement par l&apos;éditeur (voir{' '}
            <button onClick={() => navigateTo('cgu')} className="text-orange-ink underline underline-offset-2">
              CGU/CGV
            </button>, article 10)</li>
          <li><strong>Immatriculation</strong> : entrepreneur individuel exerçant une activité libérale non réglementée, non immatriculé au Registre du commerce et des sociétés (dispense d&apos;immatriculation au RCS applicable à ce statut)</li>
          <li><strong>Contact</strong> : adambeloucif@gmail.com</li>
          <li><strong>Directeur de la publication</strong> : Adam Beloucif</li>
        </ul>
        <p className="text-sm">
          Conformément à l&apos;article 6-III de la loi pour la confiance dans l&apos;économie numérique (LCEN),
          le numéro de téléphone de l&apos;éditeur est communiqué à l&apos;hébergeur mais n&apos;est pas rendu
          public, conformément à la faculté ouverte aux personnes physiques par ce même article.
        </p>
      </LegalSection>

      <LegalSection title="2. Activité commerciale">
        <p>
          Meskova propose un accès premium payant à vie (paiement unique, aucun abonnement) ainsi que des packs
          de contenu additionnels à la carte, également en paiement unique (voir{' '}
          <button onClick={() => navigateTo('cgu')} className="text-orange-ink underline underline-offset-2">
            CGU/CGV
          </button>). L&apos;activité commerciale est exercée sous le statut de micro-entreprise, validée par
          l&apos;INSEE et l&apos;URSSAF le 4 août 2026. Les conditions d&apos;exercice sont conformes à la
          législation française et européenne applicables aux éditeurs de logiciels et aux services de contenu
          numérique.
        </p>
      </LegalSection>

      <LegalSection title="3. Hébergement du site web (PWA)">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Hébergeur</strong> : Vercel Inc.</li>
          <li><strong>Adresse</strong> : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
          <li><strong>Site</strong> : vercel.com</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Fonctionnement du service et infrastructure technique">
        <p>
          Meskova fonctionne intégralement en local sur l&apos;appareil de l&apos;utilisateur : aucune création
          de compte n&apos;est nécessaire, et aucune base de données applicative opérée par l&apos;éditeur
          n&apos;héberge de donnée personnelle des utilisateurs. Le prestataire Supabase, envisagé dans
          l&apos;architecture cible pour une distribution future de contenus premium, n&apos;est{' '}
          <strong>pas connecté</strong> au service en production à la date de la présente version : aucune
          donnée n&apos;y transite. Si ce prestataire venait à être activé, la présente page et la{' '}
          <button onClick={() => navigateTo('confidentialite')} className="text-orange-ink underline underline-offset-2">
            politique de confidentialité
          </button>{' '}
          seraient mises à jour avant son activation.
        </p>
        <p>Les prestataires techniques suivants interviennent dans le fonctionnement du service, chacun pour la fonction indiquée :</p>
        <LegalTable
          headers={['Service', 'Fonction', 'Prestataire']}
          rows={[
            ['Paiement web', 'Traitement du paiement de l’accès premium et des packs à la carte sur le site', 'Stripe Payments Europe Ltd.'],
            ['Achats in-app', 'Vérification et restauration des achats effectués via l’App Store et Google Play', 'RevenueCat Inc.'],
            ['Mesure d’audience', 'Analytics produit, uniquement après consentement (instance UE)', 'PostHog (EU Cloud)'],
            ['Distribution mobile', 'Boutiques d’applications', 'Google Ireland Ltd. (Play Store), Apple Distribution International (App Store)'],
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site et des applications Meskova (charte graphique, textes, contenus de
          jeu, packs de cartes, code source, logo) est la propriété exclusive d&apos;Adam Beloucif, exercant sous
          le nom commercial BLF Lab&apos;s, sauf mention contraire. Toute reproduction, représentation,
          modification ou exploitation totale ou partielle de ces éléments, sans autorisation expresse, est
          interdite et constitutive d&apos;une contrefaçon au sens des articles L.335-2 et suivants du Code de la
          propriété intellectuelle.
        </p>
      </LegalSection>

      <LegalSection title="6. Données personnelles">
        <p>
          Le traitement des données personnelles des utilisateurs est détaillé dans la{' '}
          <button onClick={() => navigateTo('confidentialite')} className="text-orange-ink underline underline-offset-2">
            politique de confidentialité
          </button>.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies et traceurs">
        <p>
          L&apos;usage de cookies et traceurs est détaillé dans la{' '}
          <button onClick={() => navigateTo('confidentialite')} className="text-orange-ink underline underline-offset-2">
            politique de confidentialité
          </button>, avec un consentement recueilli via le bandeau accessible à tout moment depuis le pied de page.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation de responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations
          diffusées sur le site et les applications, mais ne peut garantir l&apos;absence totale d&apos;erreur ou
          d&apos;interruption de service. Meskova est un outil d&apos;animation de soirée qui ne fait aucune
          référence à l&apos;alcool ni à la consommation de quelque substance que ce soit : l&apos;utilisateur
          reste seul responsable de l&apos;usage qu&apos;il fait du service, notamment dans le cadre
          d&apos;activités sociales impliquant plusieurs joueurs.
        </p>
      </LegalSection>

      <LegalSection title="9. Médiation de la consommation">
        <p>
          Conformément aux articles L616-1 et R616-1 du Code de la consommation, en cas de litige non résolu avec
          le service client (article 12), le consommateur peut recourir gratuitement à un médiateur de la
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

      <LegalSection title="10. Crédits et ressources tierces">
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

      <LegalSection title="11. Droit applicable et litiges">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de
          résolution amiable, les tribunaux français compétents seront seuls saisis, sous réserve des dispositions
          impératives applicables aux consommateurs et de la médiation de la consommation (article 9).
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>Pour toute question relative aux présentes mentions légales : adambeloucif@gmail.com</p>
      </LegalSection>
    </LegalLayout>
  )
}
