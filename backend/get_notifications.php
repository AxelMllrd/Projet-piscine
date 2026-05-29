<?php
/**
 * get_notifications.php - Récupère les notifications de l'utilisateur connecté
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';
require_once 'notifications_functions.php';

$user_id = get_authenticated_user_id();

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["message" => "Non autorisé. Veuillez vous connecter."]);
    exit;
}

try {
    $query = "SELECT ID, Type, Contenu, Lien_Action, Est_Lu, Date_Creation 
              FROM NOTIFICATION 
              WHERE Utilisateur_ID = :user_id 
              ORDER BY Date_Creation DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':user_id' => $user_id]);
    
    $notifications = $stmt->fetchAll();
    
    echo json_encode($notifications);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
