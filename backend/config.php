<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'mercato_nova');
define('DB_USER', 'root');
define('DB_PASS', '');

// Connexion à la base de données
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=3307;dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    header("Content-Type: application/json");
    http_response_code(503);
    echo json_encode(["error" => "Service temporairement indisponible. Veuillez réessayer plus tard."]);
    exit;
}

// Fonction pour envoyer une réponse JSON
function sendResponse($data, $status = 200) {
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode($data);
    exit;
}
?>
