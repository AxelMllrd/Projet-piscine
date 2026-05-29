<?php
/**
 * register.php - Gestion de l'inscription utilisateur
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Récupération des données JSON envoyées par React
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->nom) &&
    !empty($data->prenom) &&
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->role)
) {
    // Validation de l'email
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Format d'email invalide."]);
        exit;
    }

    try {
        // Vérification si le pseudo ou l'email existe déjà
        $check_query = "SELECT id FROM users WHERE email = :email OR username = :username";
        $check_stmt = $pdo->prepare($check_query);
        $check_stmt->execute([
            ':email' => $data->email,
            ':username' => $data->username
        ]);

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Cet email ou ce pseudo est déjà utilisé."]);
            exit;
        }

        // Hachage du mot de passe pour la sécurité
        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

        // Insertion dans la base de données via requête préparée
        $query = "INSERT INTO users (nom, prenom, username, email, password, role) 
                  VALUES (:nom, :prenom, :username, :email, :password, :role)";
        
        $stmt = $pdo->prepare($query);

        if ($stmt->execute([
            ':nom' => $data->nom,
            ':prenom' => $data->prenom,
            ':username' => $data->username,
            ':email' => $data->email,
            ':password' => $hashed_password,
            ':role' => $data->role
        ])) {
            http_response_code(201);
            echo json_encode(["message" => "Utilisateur créé avec succès."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Impossible de créer l'utilisateur."]);
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
