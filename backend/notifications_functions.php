<?php
/**
 * notifications_functions.php - Fonctions utilitaires pour le système de notifications
 */

/**
 * Crée une nouvelle notification pour un utilisateur
 * 
 * @param PDO $pdo L'instance PDO
 * @param int $user_id ID du destinataire
 * @param string $type Type de notification ('favori', 'offre', 'message', 'commande')
 * @param string $contenu Le message de la notification
 * @param string|null $lien URL de redirection optionnelle
 * @return bool Succès de l'opération
 */
function create_notification($pdo, $user_id, $type, $contenu, $lien = null) {
    try {
        $query = "INSERT INTO NOTIFICATION (Utilisateur_ID, Type, Contenu, Lien_Action) 
                  VALUES (:user_id, :type, :contenu, :lien)";
        $stmt = $pdo->prepare($query);
        return $stmt->execute([
            ':user_id' => $user_id,
            ':type' => $type,
            ':contenu' => $contenu,
            ':lien' => $lien
        ]);
    } catch (PDOException $e) {
        // En production, loggez l'erreur
        return false;
    }
}

/**
 * Vérifie l'authentification de l'utilisateur (Simple simulation de token)
 * Dans un projet réel, utilisez JWT ou session_start()
 */
function get_authenticated_user_id() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        // On attend "Bearer <user_id>" pour la démo
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s(\d+)/', $authHeader, $matches)) {
            return (int)$matches[1];
        }
    }
    
    // Alternative via paramètre GET pour faciliter les tests rapides
    if (isset($_GET['user_id'])) {
        return (int)$_GET['user_id'];
    }

    return null;
}
?>
