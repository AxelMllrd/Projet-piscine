# Mercato Nova - Projet Web Dynamique 2026

Bienvenue dans le projet **Mercato Nova**, une plateforme e-commerce dynamique développée dans le cadre du module Web Dynamique (ING2).

## Architecture du Projet

Le projet est divisé en deux parties principales suivant une architecture client-serveur :

- **/frontend** : Application React (Interface utilisateur).
- **/backend** : API PHP (Logique métier et accès aux données).
- **/database** : Schémas SQL et scripts de migration.
- **/docs** : Documentation du projet.

## Technologies Utilisées

- **Frontend** : React.js, CSS3, HTML5.
- **Backend** : PHP 8+, PDO pour la connexion MySQL.
- **Base de données** : MySQL.

## Installation et Lancement

### 1. Base de données
- Importez le fichier `database/schema.sql` dans votre serveur MySQL (via phpMyAdmin ou ligne de commande).
- Configurez les accès dans `backend/config.php`.

### 2. Backend (PHP)
- Assurez-vous d'avoir un serveur local (XAMPP, WAMP, ou serveur PHP intégré).
- Le backend doit être accessible via une URL locale (ex: `http://localhost/backend/`).

### 3. Frontend (React)
- Allez dans le dossier `frontend/`.
- Installez les dépendances : `npm install`.
- Lancez l'application : `npm start`.

## Fonctionnalités Clés
- **Gestion des utilisateurs** : Authentification et rôles (Admin, Vendeur, Acheteur).
- **Catalogue** : Recherche, filtrage et tri des articles.
- **Transactions** :
    - Achat immédiat.
    - Système d'enchères avec historique.
    - Négociation directe entre acheteur et vendeur.
- **Notifications** : Alertes en temps réel sur l'activité des transactions.

## Auteurs
Équipe d'étudiants ING2 - 2026.
