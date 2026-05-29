<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'config.php';

// Routeur basique
$action = isset($_GET['action']) ? $_GET['action'] : 'status';

switch ($action) {
    case 'status':
        sendResponse(['status' => 'ok', 'message' => 'API Mercato Nova est en ligne']);
        break;
    
    case 'items':
      try {
            // On va chercher toutes les annonces actives dans la base de données MariaDB
            $stmt = $pdo->query("SELECT * FROM items WHERE status = 'active' ORDER BY created_at DESC");
            $items = $stmt->fetchAll();
            
            // On renvoie les vraies données au frontend
            sendResponse($items);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD : ' . $e->getMessage()], 500);
        }
        break;

    case 'auction_details':
        $auction_id = $_GET['id'] ?? 0;
        // Mock auction details for demonstration
        $auction = [
            'id' => 1,
            'item_id' => 3, // Kitesurf North Reach 9m
            'item_name' => 'Kitesurf North Reach 9m',
            'starting_price' => 500.00,
            'current_bid' => 620.00,
            'end_time' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'status' => 'active',
            'history' => [
                ['user' => 'Jean L.', 'amount' => 620.00, 'time' => '2026-05-28 14:30:00'],
                ['user' => 'Marie S.', 'amount' => 600.00, 'time' => '2026-05-28 12:15:00'],
                ['user' => 'Pierre D.', 'amount' => 550.00, 'time' => '2026-05-28 10:00:00']
            ]
        ];
        sendResponse($auction);
        break;

    case 'place_bid':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendResponse(['error' => 'Méthode non autorisée'], 405);
        }
        $input   = json_decode(file_get_contents('php://input'), true);
        $item_id = isset($input['item_id'])  ? (int)$input['item_id']   : 0;
        $user_id = isset($input['user_id'])  ? (int)$input['user_id']   : 0;
        $amount  = isset($input['amount'])   ? (float)$input['amount']  : 0;

        if (!$item_id || !$user_id || $amount <= 0) {
            sendResponse(['error' => 'Données incomplètes.'], 400);
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                "SELECT id, current_bid, status FROM auctions WHERE item_id = ? FOR UPDATE"
            );
            $stmt->execute([$item_id]);
            $auction = $stmt->fetch();

            if (!$auction) {
                $pdo->rollBack();
                sendResponse(['error' => 'Enchère introuvable pour cet article.'], 404);
            }
            if ($auction['status'] !== 'active') {
                $pdo->rollBack();
                sendResponse(['error' => "L'enchère est terminée."], 400);
            }
            if ($amount <= (float)$auction['current_bid']) {
                $pdo->rollBack();
                sendResponse([
                    'error' => "L'offre doit être strictement supérieure à l'enchère actuelle de "
                               . number_format($auction['current_bid'], 2, ',', ' ') . " €."
                ], 400);
            }

            $stmt = $pdo->prepare(
                "UPDATE auctions SET current_bid = ?, highest_bidder_id = ? WHERE id = ?"
            );
            $stmt->execute([$amount, $user_id, $auction['id']]);

            $stmt = $pdo->prepare(
                "INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)"
            );
            $stmt->execute([$auction['id'], $user_id, $amount]);

            $pdo->commit();

            sendResponse([
                'success' => true,
                'message' => "Enchère de " . number_format($amount, 2, ',', ' ') . " € placée avec succès !",
                'new_bid' => $amount
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            sendResponse(['error' => "Erreur serveur lors de l'enchère."], 500);
        }
        break;

    case 'place_buy':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendResponse(['error' => 'Méthode non autorisée'], 405);
        }
        $input   = json_decode(file_get_contents('php://input'), true);
        $item_id = isset($input['item_id']) ? (int)$input['item_id'] : 0;

        if (!$item_id) {
            sendResponse(['error' => 'Article non spécifié.'], 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT id, status FROM items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch();

            if (!$item) {
                sendResponse(['error' => 'Article introuvable.'], 404);
            }
            if ($item['status'] === 'sold') {
                sendResponse(['error' => 'Cet article a déjà été vendu.'], 400);
            }

            $stmt = $pdo->prepare("UPDATE items SET status = 'sold' WHERE id = ?");
            $stmt->execute([$item_id]);

            sendResponse([
                'success' => true,
                'message' => 'Achat confirmé ! Le vendeur vous contactera prochainement.'
            ]);
        } catch (PDOException $e) {
            sendResponse(['error' => "Erreur serveur lors de l'achat."], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Action non reconnue'], 404);
        break;
}
?>
