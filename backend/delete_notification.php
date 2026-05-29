<?php
/**
 * delete_notification.php - Supprime une notification spécifique
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';
require_once 'notifications_functions.php';

$user_id = get_authenticated_user_id();

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["message" => "Non autorisé."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->notification_id)) {
    http_response_code(400);
    echo json_encode(["message" => "ID de notification manquant."]);
    exit;
}

try {
    $query = "DELETE FROM NOTIFICATION WHERE ID = :id AND Utilisateur_ID = :user_id";
    $stmt = $pdo->prepare($query);
    $stmt->execute([':id' => $data->notification_id, ':user_id' => $user_id]);

    echo json_encode(["message" => "Notification supprimée."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
