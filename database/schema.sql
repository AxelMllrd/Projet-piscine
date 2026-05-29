-- Schema pour la plateforme Mercato Nova

CREATE DATABASE IF NOT EXISTS mercato_nova;
USE mercato_nova;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS items (
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
CREATE TABLE IF NOT EXISTS auctions (
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

-- Table de l'historique des offres (Bids)
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des ANNONCES (Version demandée par l'utilisateur)
CREATE TABLE IF NOT EXISTS ANNONCE (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Utilisateur_ID INT NOT NULL,
    Titre VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Categorie ENUM('Wingfoil', 'Kitesurf', 'Accessoire', 'Néoprène', 'Planche à voile', 'Pièce détachée') NOT NULL,
    Etat ENUM('Neuf', 'Très bon état', 'Bon état', 'Satisfaisant') NOT NULL,
    Type_de_vente ENUM('Achat immédiat', 'Enchère', 'Négociation') NOT NULL,
    Prix DECIMAL(10, 2) NOT NULL,
    Images JSON, -- Pour stocker un tableau de chemins de fichiers
    Date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Utilisateur_ID) REFERENCES users(id) ON DELETE CASCADE
);


-- Table des négociations
CREATE TABLE IF NOT EXISTS negotiations (
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
CREATE TABLE IF NOT EXISTS negotiation_messages (
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

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
