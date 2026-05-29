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
$prix_saisi = $_POST['prix'] ?? null;
$accepte_nego = $_POST['accepte_nego'] ?? 0;

// Logique métier pour la table ANNONCE
$db_date_fin_enchere = null;
$db_prix = (float)$prix_saisi;
$db_accepte_nego = (int)$accepte_nego;

if ($type_vente === 'Enchère') {
    $db_prix = 1.00;
    $db_accepte_nego = 0;
    // NOW() + 7 days
    $db_date_fin_enchere = date('Y-m-d H:i:s', strtotime('+7 days'));
} else {
    $db_date_fin_enchere = null;
    // Le prix et accepte_nego restent ceux du formulaire
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

try {
    // Insertion dans la table ANNONCE
    $stmt = $pdo->prepare(
        "INSERT INTO ANNONCE (Utilisateur_ID, Titre, Description, Categorie, Etat, Type_de_vente, Accepte_Nego, Prix, Date_Fin_Enchere, Images)
         VALUES (:user_id, :titre, :description, :categorie, :etat, :type_vente, :accepte_nego, :prix, :date_fin, :images)"
    );
    
    $stmt->execute([
        ':user_id'      => $user_id,
        ':titre'        => $titre,
        ':description'  => $description,
        ':categorie'    => $categorie,
        ':etat'         => $etat,
        ':type_vente'   => $type_vente,
        ':accepte_nego' => $db_accepte_nego,
        ':prix'         => $db_prix,
        ':date_fin'     => $db_date_fin_enchere,
        ':images'       => json_encode($image_paths)
    ]);

    $ad_id = $pdo->lastInsertId();

    // Rétrocompatibilité avec la table items (si nécessaire pour le reste du site)
    $category_map = [
        'Wingfoil' => 'wingfoil', 'Kitesurf' => 'kitesurf', 
        'Accessoire' => 'surf', 'Néoprène' => 'surf', 
        'Planche à voile' => 'windsurf', 'Pièce détachée' => 'surf'
    ];
    $db_cat_legacy = $category_map[$categorie] ?? 'surf';
    $db_cond_legacy = ($etat === 'Neuf') ? 'new' : 'used';
    $db_sale_type_legacy = ($type_vente === 'Enchère') ? 'auction' : 'immediate';

    $stmt_legacy = $pdo->prepare(
        "INSERT INTO items (seller_id, name, description, category, item_condition, price, sale_type, image_url)
         VALUES (:seller_id, :name, :desc, :cat, :cond, :prix, :sale_type, :img)"
    );
    $stmt_legacy->execute([
        ':seller_id' => $user_id,
        ':name'      => $titre,
        ':desc'      => $description,
        ':cat'       => $db_cat_legacy,
        ':cond'      => $db_cond_legacy,
        ':prix'      => $db_prix,
        ':sale_type' => $db_sale_type_legacy,
        ':img'       => $image_paths[0] ?? null,
    ]);
    
    $item_id = $pdo->lastInsertId();

    if ($type_vente === 'Enchère') {
        $stmt_auction = $pdo->prepare(
            "INSERT INTO auctions (item_id, starting_price, current_bid, end_time)
             VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))"
        );
<<<<<<< HEAD
        $stmt_auction->execute([$item_id, 1.00, 1.00, $db_date_fin_enchere]);
=======
        $stmt->execute([
            $item_id,
            $prix,
            $prix,
        ]);
>>>>>>> 22c7da7ab9298a22eddf1ece831c37bb719e6b40
    }

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Annonce créée avec succès.",
        "ad_id"   => $ad_id
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
