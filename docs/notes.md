# Héric Musique

Ces notes contiennent des éléments pour spécifier ce que pourrait être
un système d'information dédié à l'équipe de Héric Musique.

Ce système pourrait s'adresser tant aux bénévoles du bureau,
au directeur de l'école, aux adhérents, aux élèves, et bien sûr aux professeurs.

J'écris ces notes en étant actuellement en poste de Trésorier en devenir,
avec un regard nouveau sur l'activité de cette école, 
des processus qui existent, implicitement ou explicitement,
des gênes rencontrées - et ce sera plutôt personnel -
et de mon regard d'expert technico-fonctionnel étant dans le domaine de l'informatique.

## État des lieux du fonctionnement actuel

### Briques logicielles utilisées

* Hello Asso pour les inscriptions ET les paiements
* Google Mail : heric.musique@gmail.com
* Google Drive pour stockage des fichiers à partager
* Google Forms pour les formulaires d'inscription
* Google spreadsheets pour la gestion des inscriptions

### Briques non logicielles

* formulaire papier d'inscription

### Gênes rencontrées

* gestion des inscriptions
  * report des inscriptions papiers sur le tableur
  * fusion des inscriptions en provenance du formulaire en ligne
* gestion de la connexion au compte Google avec 2FA
* hébergement des données
* gestion des paiements chèque / hello asso / ANCV / ...
* suivi du paiement
  * multi mode : chèque, liquide, hello asso, ANCV...
  * suivi hello asso délicat, on sait pas qui a payé quoi...
* utilisation de logiciels privateurs ou des GAFAM

## Définition des besoins

### Définition des personas

* membre du bureau
* président
* trésorier
* responsable RH
* directeur de l'école
* professeur
* adhérent
* élève

### Définition des user stories

**Membre du bureau**

**Président**

**Trésorier**

**Responsable RH**

**Directeur de l'école**

**Professeur**

**Adhérent**

**Élève**

## Projection d'architecture

* Frama Space en remplaçant de Google Drive

* Listes de diffusion dédiées avec groupe WhatsApp également
  * CA (lebureau@hericmusique.fr)
  * Trésorerie / RH (letresor@hericmusique.fr)
  * direction (direction@hericmusique.fr)
  * contact (arrose auprès d'un ensemble de personne dédiées à la réponse sur une adresse contact@hericmusique.fr)

* LocoKit pour la gestion des adhérents / élèves / professeurs
  * adhésion (par famille)
  * inscription (par élève)
  * créneau de cours avec prof / élève / salle
  * état des paiements (chèque, hello asso, ancv, ...)
  * espace documentaire (en lieu et place de frama space ? ou on s'appuie sur frama space avec "lien" nextcloud ?)
  * approche documentaire à la notion pour permettre d'écrire les processus (fiche directeur, chaque mois, il faut faire x,y,z,...)
  * avec connectivité sur autre auth type Google / FB / ...