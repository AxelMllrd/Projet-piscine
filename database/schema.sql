-- Schema pour la plateforme Mercato Nova

CREATE DATABASE IF NOT EXISTS mercato_nova;
USE mercato_nova;

SET FOREIGN_KEY_CHECKS = 0;

-- Table des utilisateurs
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('acheteur', 'vendeur', 'admin') DEFAULT 'acheteur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits / articles
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('surf', 'windsurf', 'windfoil', 'wingfoil', 'pumpfoil', 'kitesurf', 'kitefoil') NOT NULL,
    item_condition ENUM('new', 'used') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sale_type ENUM('immediate', 'auction', 'negotiation') NOT NULL,
    status ENUM('active', 'sold', 'expired') DEFAULT 'active',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des enchères
DROP TABLE IF EXISTS auctions;
CREATE TABLE auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2) NOT NULL,
    highest_bidder_id INT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NOT NULL,
    status ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (highest_bidder_id) REFERENCES users(id)
);

-- Table des ANNONCES (Version mise à jour)
DROP TABLE IF EXISTS ANNONCE;
CREATE TABLE ANNONCE (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Utilisateur_ID INT NOT NULL,
    Titre VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Categorie ENUM('Wingfoil', 'Kitesurf', 'Accessoire', 'Néoprène', 'Planche à voile', 'Pièce détachée') NOT NULL,
    Etat ENUM('Neuf', 'Très bon état', 'Bon état', 'Satisfaisant') NOT NULL,
    Type_de_vente ENUM('Achat immédiat', 'Enchère') NOT NULL,
    Accepte_Nego BOOLEAN DEFAULT FALSE,
    Prix DECIMAL(10, 2) NOT NULL,
    Date_Fin_Enchere DATETIME NULL,
    Images JSON, -- Pour stocker un tableau de chemins de fichiers
    Date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Utilisateur_ID) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de l'historique des offres (Bids)
DROP TABLE IF EXISTS bids;
CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ANNONCE(ID) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des achats effectués
DROP TABLE IF EXISTS purchases;
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    buyer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ANNONCE(ID) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des négociations
DROP TABLE IF EXISTS negotiations;
CREATE TABLE negotiations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    buyer_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    last_offer DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table historique des messages de négociation
DROP TABLE IF EXISTS negotiation_messages;
CREATE TABLE negotiation_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negotiation_id INT NOT NULL,
    sender_id INT NOT NULL,
    type ENUM('offer','counter','accept','reject') NOT NULL,
    amount DECIMAL(10,2),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negotiation_id) REFERENCES negotiations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications (Version centralisée)
DROP TABLE IF EXISTS NOTIFICATION;
CREATE TABLE NOTIFICATION (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Utilisateur_ID INT NOT NULL,
    Type ENUM('favori', 'offre', 'message', 'commande') NOT NULL,
    Contenu VARCHAR(255) NOT NULL,
    Lien_Action VARCHAR(255),
    Est_Lu BOOLEAN DEFAULT FALSE,
    Date_Creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Utilisateur_ID) REFERENCES users(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
