# Bacchus

## Core Value

Un jeu de societe pour soirees entre amis, qui tient dans une application, fonctionne
hors ligne et sans compte, et se paie une fois pour toutes au lieu de s'abonner.

## Positionnement

Le marche des applications de jeu de soiree est domine par le modele freemium a
abonnement, avec des prix souvent opaques, ce qui est l'irritant numero un releve
dans l'etude de marche. L'angle de Bacchus est l'inverse assume : **transparence
tarifaire et achat a vie**, 12,99 euros pour le pass complet, aucun essai gratuit
piege, aucun abonnement.

## Contrainte structurante

L'application ne doit contenir **aucune reference a l'alcool**, ni dans le texte, ni
dans le contenu, ni dans l'imagerie, ni dans le nom. Motif : la guideline Apple 1.4.3
interdit les applications qui encouragent la consommation excessive d'alcool, et la
guideline 4.3 sur le spam est le second risque de rejet reel du secteur, tres peuple
en jeux d'apero.

Ce que cela implique concretement : les penalites du jeu sont abstraites, jamais des
gorgees. Une garde d'integration continue (`npm run check:alcohol`) verifie le code
source contre 21 termes et casse la CI si l'un reapparait.

## Historique du nom

Cinq noms se sont succede : BlackOut, La Taverne, La Tournee, Meskova, puis
**Bacchus**, arrete le 5 aout 2026. Ce dernier est definitif.

Reserve consignee, et assumee par le porteur : Bacchus est le dieu romain du vin, donc
le nom porte lui-meme une association alcoolique, ce qui est en tension avec la
contrainte ci-dessus. La decision a ete prise en connaissance de cause. La consequence
operationnelle est que **tout le reste de l'identite doit etre irreprochable** : le
registre visuel retenu est celui du theatre, dont Bacchus est aussi le dieu, ce qui
donne au nom une lecture non alcoolique defendable devant un reviewer.

Domaines : `bacchus.com` et `bacchus.fr` sont pris. Le produit vivra donc sur un
sous-domaine de `beloucif.com`.

## Editeur

Adam Beloucif, micro-entreprise, nom commercial BLF Lab's.
SIREN 108386855, SIRET 10838685500010, code APE 6201Z, activite liberale.
Contact : adam@beloucif.com. Mediateur de la consommation : CM2C, adhesion active.

## Key Decisions

| Date | Decision | Motif |
|---|---|---|
| 2026-08-05 | Nom definitif Bacchus | Decision du porteur, apres examen des risques |
| 2026-08-05 | Registre visuel du theatre | Seul registre bachique sans connotation alcoolique |
| 2026-08-05 | Achat a vie, aucun abonnement | Differenciation face a un marche a abonnement opaque |
| 2026-08-05 | Cache d'acces payant borne a 7 jours | Sans serveur, l'invariant ne peut qu'etre borne, pas prouve |
| 2026-08-05 | Contenu payant jamais embarque dans le paquet | Vraie protection de la monetisation cote web |
