<?php
/**
 * mark_as_read.php - Passe une ou toutes les notifications à "lu"
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

try {
    if (isset($data->notification_id)) {
        // Marquer une notification spécifique comme lue
        $query = "UPDATE NOTIFICATION SET Est_Lu = 1 
                  WHERE ID = :id AND Utilisateur_ID = :user_id";
        $stmt = $pdo->prepare($query);
        $stmt->execute([':id' => $data->notification_id, ':user_id' => $user_id]);
    } else {
        // Marquer TOUTES les notifications de l'utilisateur comme lues
        $query = "UPDATE NOTIFICATION SET Est_Lu = 1 
                  WHERE Utilisateur_ID = :user_id AND Est_Lu = 0";
        $stmt = $pdo->prepare($query);
        $stmt->execute([':user_id' => $user_id]);
    }

    echo json_encode(["message" => "Succès"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}
?>
