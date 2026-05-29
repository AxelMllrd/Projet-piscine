<?php
/**
 * get_user_stats.php - Récupère les statistiques réelles d'un utilisateur
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once 'config.php';

if (!empty($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    try {
        // 1. Nombre d'achats (items achetés en vente immédiate ou enchère gagnée)
        // Note: Pour simplifier, on compte les items vendus dont le buyer_id serait cet utilisateur 
        // (il faudrait une table 'orders' idéalement, mais on va simuler avec les tables existantes)
        $query_buys = "SELECT COUNT(*) as total FROM items WHERE status = 'sold' AND id IN (SELECT item_id FROM negotiations WHERE buyer_id = :uid AND status = 'accepted')";
        $stmt_buys = $pdo->prepare($query_buys);
        $stmt_buys->execute([':uid' => $user_id]);
        $buys = $stmt_buys->fetch()['total'];

        // 2. Nombre d'enchères en cours/passées auxquelles l'utilisateur a participé
        $query_bids = "SELECT COUNT(DISTINCT auction_id) as total FROM bids WHERE user_id = :uid";
        $stmt_bids = $pdo->prepare($query_bids);
        $stmt_bids->execute([':uid' => $user_id]);
        $bids = $stmt_bids->fetch()['total'];

        // 3. Nombre de ventes (items mis en vente par l'utilisateur)
        $query_sales = "SELECT COUNT(*) as total FROM items WHERE seller_id = :uid";
        $stmt_sales = $pdo->prepare($query_sales);
        $stmt_sales->execute([':uid' => $user_id]);
        $sales = $stmt_sales->fetch()['total'];

        echo json_encode([
            "success" => true,
            "stats" => [
                "buys" => (int)$buys,
                "bids" => (int)$bids,
                "sales" => (int)$sales
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Erreur serveur : " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ID utilisateur manquant."]);
}
?>
