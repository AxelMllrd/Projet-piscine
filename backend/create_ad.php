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
$upload_dir = __DIR__ . '/uploads/';
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
                $image_paths[] = 'backend/uploads/' . $new_filename;
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

// Mapping vers les valeurs ENUM de la table items
$category_map = [
    'wingfoil' => 'wingfoil', 'Wingfoil' => 'wingfoil',
    'kitesurf' => 'kitesurf', 'Kitesurf' => 'kitesurf',
    'windsurf' => 'windsurf', 'Planche à voile' => 'windsurf',
    'surf'     => 'surf',     'Surf'     => 'surf',
    'windfoil' => 'windfoil', 'Windfoil' => 'windfoil',
    'kitefoil' => 'kitefoil', 'Kitefoil' => 'kitefoil',
    'pumpfoil' => 'pumpfoil',
];
$condition_map = [
    'new'    => 'new',  'Neuf'          => 'new',
    'used'   => 'used', 'Occasion'      => 'used',
    'Très bon état' => 'used', 'Bon état' => 'used', 'Satisfaisant' => 'used',
];
$sale_type_map = [
    'immediate'   => 'immediate',   'Achat immédiat' => 'immediate',
    'auction'     => 'auction',     'Enchère'        => 'auction',
    'negotiation' => 'negotiation', 'Négociation'    => 'negotiation',
];

$db_category  = $category_map[$categorie]    ?? null;
$db_condition = $condition_map[$etat]        ?? null;
$db_sale_type = $sale_type_map[$type_vente]  ?? null;

if (!$db_category || !$db_condition || !$db_sale_type) {
    http_response_code(400);
    echo json_encode(["message" => "Catégorie, état ou type de vente invalide."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "INSERT INTO items (seller_id, name, description, category, item_condition, price, sale_type, image_url)
         VALUES (:seller_id, :name, :desc, :cat, :cond, :prix, :sale_type, :img)"
    );
    $stmt->execute([
        ':seller_id' => $user_id,
        ':name'      => $titre,
        ':desc'      => $description,
        ':cat'       => $db_category,
        ':cond'      => $db_condition,
        ':prix'      => $prix,
        ':sale_type' => $db_sale_type,
        ':img'       => $image_paths[0] ?? null,
    ]);

    $item_id = $pdo->lastInsertId();

    if ($db_sale_type === 'auction') {
        $stmt = $pdo->prepare(
            "INSERT INTO auctions (item_id, starting_price, current_bid, end_time)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([
            $item_id,
            $prix,
            $prix,
            date('Y-m-d H:i:s', strtotime('+7 days'))
        ]);
    }

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Annonce créée avec succès.",
        "ad_id"   => $item_id
    ]);

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
