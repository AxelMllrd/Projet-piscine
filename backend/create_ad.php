<?php
/**
 * create_ad.php - API pour la création d'une annonce
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Dossier d'upload
$upload_dir = 'uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Vérification de la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Méthode non autorisée."]);
    exit;
}

// Récupération des données POST (form-data)
$user_id = $_POST['user_id'] ?? null;
$titre = $_POST['titre'] ?? null;
$description = $_POST['description'] ?? null;
$categorie = $_POST['categorie'] ?? null;
$etat = $_POST['etat'] ?? null;
$type_vente = $_POST['type_vente'] ?? null;
$prix = $_POST['prix'] ?? null;

// Validation simple
if (!$user_id || !$titre || !$description || !$categorie || !$etat || !$type_vente || !$prix) {
    http_response_code(400);
    echo json_encode(["message" => "Données incomplètes."]);
    exit;
}

// Gestion des images
$image_paths = [];
if (!empty($_FILES['images'])) {
    $files = $_FILES['images'];
    $count = count($files['name']);

    for ($i = 0; $i < $count; $i++) {
        if ($files['error'][$i] === UPLOAD_ERR_OK) {
            $tmp_name = $files['tmp_name'][$i];
            $name = basename($files['name'][$i]);
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            
            // Sécurité : Vérification de l'extension
            $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];
            if (!in_array($extension, $allowed_extensions)) {
                continue; // On ignore les fichiers non autorisés
            }

            // Sécurité : Taille max 5Mo
            if ($files['size'][$i] > 5 * 1024 * 1024) {
                continue;
            }

            // Renommage sécurisé
            $new_filename = uniqid('ad_', true) . '.' . $extension;
            $destination = $upload_dir . $new_filename;

            if (move_uploaded_file($tmp_name, $destination)) {
                $image_paths[] = $destination;
            }
        }
    }
}

// Au moins une image requise
if (empty($image_paths)) {
    http_response_code(400);
    echo json_encode(["message" => "Au moins une image valide est requise."]);
    exit;
}

try {
    $query = "INSERT INTO ANNONCE (Utilisateur_ID, Titre, Description, Categorie, Etat, Type_de_vente, Prix, Images) 
              VALUES (:uid, :titre, :desc, :cat, :etat, :type, :prix, :imgs)";
    
    $stmt = $pdo->prepare($query);
    
    $result = $stmt->execute([
        ':uid' => $user_id,
        ':titre' => $titre,
        ':desc' => $description,
        ':cat' => $categorie,
        ':etat' => $etat,
        ':type' => $type_vente,
        ':prix' => $prix,
        ':imgs' => json_encode($image_paths)
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Annonce créée avec succès.",
            "ad_id" => $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Erreur lors de l'insertion en base de données."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
}

/**
 * COMMENT TESTER L'UPLOAD EN LOCAL :
 * 1. Assurez-vous que le dossier 'backend/uploads' a les droits en écriture.
 * 2. Utilisez un outil comme Postman ou le composant React fourni.
 * 3. En POST (multipart/form-data), envoyez :
 *    - user_id (int)
 *    - titre (string)
 *    - description (string)
 *    - categorie (string, voir enum)
 *    - etat (string, voir enum)
 *    - type_vente (string, voir enum)
 *    - prix (float)
 *    - images[] (File) -> Sélectionnez plusieurs fichiers.
 */
?>
