<?php
/**
 * login.php - Gestion de la connexion utilisateur
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->identifier) && !empty($data->password)) {
    try {
        // On cherche par email OU par pseudo
        $query = "SELECT id, username, email, password, role FROM users WHERE email = :id OR username = :id";
        $stmt = $pdo->prepare($query);
        $stmt->execute([':id' => $data->identifier]);

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch();
            $id = $row['id'];
            $username = $row['username'];
            $hashed_password = $row['password'];
            $role = $row['role'];

            // Vérification du mot de passe haché
            if (password_verify($data->password, $hashed_password)) {
                // Authentification réussie
                // Dans un projet réel, on utiliserait un JWT ici
                http_response_code(200);
                echo json_encode([
                    "message" => "Connexion réussie.",
                    "user" => [
                        "id" => $id,
                        "username" => $username,
                        "email" => $row['email'],
                        "role" => $role
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Mot de passe incorrect."]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Utilisateur non trouvé."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Données incomplètes."]);
}
?>
