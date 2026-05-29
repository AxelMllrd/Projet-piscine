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

// Crée la table d'historique de négociation si elle n'existe pas encore
$pdo->exec("CREATE TABLE IF NOT EXISTS negotiation_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    negotiation_id INT NOT NULL,
    sender_id INT NOT NULL,
    type ENUM('offer','counter','accept','reject') NOT NULL,
    amount DECIMAL(10,2),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negotiation_id) REFERENCES negotiations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

function addNotification(PDO $pdo, int $user_id, string $message): void {
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
    $stmt->execute([$user_id, $message]);
}

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

    case 'item_detail':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            sendResponse(['error' => 'ID non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if (!$item) {
                sendResponse(['error' => 'Article introuvable.'], 404);
            }
            if ($item['sale_type'] === 'auction') {
                $stmt = $pdo->prepare(
                    "SELECT id, current_bid, end_time, status FROM auctions WHERE item_id = ?"
                );
                $stmt->execute([$id]);
                $auction_row = $stmt->fetch();
                if ($auction_row) {
                    $item['auction'] = $auction_row;
                }
            }
            sendResponse($item);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
        break;

    case 'auction_details':
        $auction_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$auction_id) {
            sendResponse(['error' => 'ID non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare(
                "SELECT a.*, i.name AS item_name
                 FROM auctions a JOIN items i ON a.item_id = i.id
                 WHERE a.id = ?"
            );
            $stmt->execute([$auction_id]);
            $auction = $stmt->fetch();
            if (!$auction) {
                sendResponse(['error' => 'Enchère introuvable.'], 404);
            }
            $stmt = $pdo->prepare(
                "SELECT b.amount, b.bid_time, u.username
                 FROM bids b JOIN users u ON b.user_id = u.id
                 WHERE b.auction_id = ?
                 ORDER BY b.bid_time DESC LIMIT 10"
            );
            $stmt->execute([$auction['id']]);
            $auction['history'] = $stmt->fetchAll();
            sendResponse($auction);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
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
            $stmt = $pdo->prepare("SELECT id, name, seller_id FROM items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item_row = $stmt->fetch();
            if ($item_row && (int)$item_row['seller_id'] === $user_id) {
                sendResponse(['error' => "Vous ne pouvez pas enchérir sur votre propre annonce."], 403);
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                "SELECT id, current_bid, highest_bidder_id, status FROM auctions WHERE item_id = ? FOR UPDATE"
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

            // Notifier l'ancien meilleur enchérisseur s'il existe et n'est pas le nouvel enchérisseur
            $prev_bidder = $auction['highest_bidder_id'] ? (int)$auction['highest_bidder_id'] : null;
            if ($prev_bidder && $prev_bidder !== $user_id) {
                $item_name = $item_row['name'] ?? 'un article';
                addNotification($pdo, $prev_bidder, "Vous avez été dépassé sur l'enchère \"{$item_name}\" — nouvelle offre : " . number_format($amount, 2, ',', ' ') . " €.");
            }

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
        $user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;

        if (!$item_id || !$user_id) {
            sendResponse(['error' => 'Données incomplètes.'], 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT id, name, status, seller_id FROM items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch();

            if (!$item) {
                sendResponse(['error' => 'Article introuvable.'], 404);
            }
            if ((int)$item['seller_id'] === $user_id) {
                sendResponse(['error' => "Vous ne pouvez pas acheter votre propre article."], 403);
            }
            if ($item['status'] === 'sold') {
                sendResponse(['error' => 'Cet article a déjà été vendu.'], 400);
            }

            $stmt = $pdo->prepare("UPDATE items SET status = 'sold' WHERE id = ?");
            $stmt->execute([$item_id]);

            addNotification($pdo, (int)$item['seller_id'], "Votre article \"{$item['name']}\" a été acheté !");

            sendResponse([
                'success' => true,
                'message' => 'Achat confirmé ! Le vendeur vous contactera prochainement.'
            ]);
        } catch (PDOException $e) {
            sendResponse(['error' => "Erreur serveur lors de l'achat."], 500);
        }
        break;

    case 'start_negotiation':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendResponse(['error' => 'Méthode non autorisée'], 405);
        }
        $input    = json_decode(file_get_contents('php://input'), true);
        $item_id  = isset($input['item_id'])  ? (int)$input['item_id']  : 0;
        $buyer_id = isset($input['buyer_id']) ? (int)$input['buyer_id'] : 0;
        $offer    = isset($input['offer'])    ? (float)$input['offer']  : 0;

        if (!$item_id || !$buyer_id || $offer <= 0) {
            sendResponse(['error' => 'Données incomplètes.'], 400);
        }
        try {
            $stmt = $pdo->prepare("SELECT id, name, sale_type, status, seller_id FROM items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch();

            if (!$item || $item['status'] !== 'active') {
                sendResponse(['error' => 'Article indisponible.'], 400);
            }
            if ($item['sale_type'] !== 'negotiation') {
                sendResponse(['error' => "Cet article ne propose pas la négociation."], 400);
            }
            if ((int)$item['seller_id'] === $buyer_id) {
                sendResponse(['error' => "Vous ne pouvez pas négocier sur votre propre annonce."], 403);
            }

            $stmt = $pdo->prepare(
                "SELECT id FROM negotiations
                 WHERE item_id = ? AND buyer_id = ? AND status = 'pending' LIMIT 1"
            );
            $stmt->execute([$item_id, $buyer_id]);
            if ($stmt->fetch()) {
                sendResponse(['error' => 'Une négociation est déjà en cours pour cet article.'], 400);
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                "INSERT INTO negotiations (item_id, buyer_id, status, last_offer) VALUES (?, ?, 'pending', ?)"
            );
            $stmt->execute([$item_id, $buyer_id, $offer]);
            $nego_id = $pdo->lastInsertId();

            $stmt = $pdo->prepare(
                "INSERT INTO negotiation_messages (negotiation_id, sender_id, type, amount) VALUES (?, ?, 'offer', ?)"
            );
            $stmt->execute([$nego_id, $buyer_id, $offer]);

            $pdo->commit();

            addNotification($pdo, (int)$item['seller_id'], "Nouvelle offre de " . number_format($offer, 2, ',', ' ') . " € pour votre article \"{$item['name']}\".");

            sendResponse([
                'success'        => true,
                'message'        => "Votre offre de " . number_format($offer, 2, ',', ' ') . " € a été envoyée au vendeur.",
                'negotiation_id' => $nego_id
            ]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(['error' => 'Erreur serveur.'], 500);
        }
        break;

    case 'my_negotiations':
        $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        if (!$user_id) {
            sendResponse(['error' => 'Utilisateur non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare(
                "SELECT n.id, n.status, n.last_offer, n.created_at,
                        i.name AS item_name, i.price AS item_price,
                        ub.username AS buyer_username,
                        us.username AS seller_username,
                        CASE WHEN n.buyer_id = ? THEN 'buyer' ELSE 'seller' END AS my_role
                 FROM negotiations n
                 JOIN items i  ON n.item_id  = i.id
                 JOIN users ub ON n.buyer_id  = ub.id
                 JOIN users us ON i.seller_id = us.id
                 WHERE n.buyer_id = ? OR i.seller_id = ?
                 ORDER BY n.created_at DESC"
            );
            $stmt->execute([$user_id, $user_id, $user_id]);
            sendResponse($stmt->fetchAll());
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
        break;

    case 'get_negotiation':
        $nego_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$nego_id) {
            sendResponse(['error' => 'ID non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare(
                "SELECT n.*,
                        i.name AS item_name, i.price AS item_price, i.image_url, i.seller_id,
                        ub.username AS buyer_username,
                        us.username AS seller_username
                 FROM negotiations n
                 JOIN items i  ON n.item_id  = i.id
                 JOIN users ub ON n.buyer_id  = ub.id
                 JOIN users us ON i.seller_id = us.id
                 WHERE n.id = ?"
            );
            $stmt->execute([$nego_id]);
            $nego = $stmt->fetch();
            if (!$nego) {
                sendResponse(['error' => 'Négociation introuvable.'], 404);
            }

            $stmt = $pdo->prepare(
                "SELECT nm.*, u.username AS sender_username
                 FROM negotiation_messages nm
                 JOIN users u ON nm.sender_id = u.id
                 WHERE nm.negotiation_id = ?
                 ORDER BY nm.created_at ASC"
            );
            $stmt->execute([$nego_id]);
            $nego['messages']       = $stmt->fetchAll();
            $nego['exchange_count'] = count($nego['messages']);

            sendResponse($nego);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
        break;

    case 'reply_negotiation':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendResponse(['error' => 'Méthode non autorisée'], 405);
        }
        $input   = json_decode(file_get_contents('php://input'), true);
        $nego_id = isset($input['negotiation_id']) ? (int)$input['negotiation_id'] : 0;
        $user_id = isset($input['user_id'])        ? (int)$input['user_id']        : 0;
        $action  = $input['action']  ?? '';
        $amount  = isset($input['amount'])  && $input['amount'] !== null ? (float)$input['amount']  : null;
        $message = isset($input['message']) && trim($input['message']) !== '' ? trim($input['message']) : null;

        if (!$nego_id || !$user_id || !in_array($action, ['accept', 'reject', 'counter'])) {
            sendResponse(['error' => 'Données incomplètes.'], 400);
        }
        if ($action === 'counter' && ($amount === null || $amount <= 0)) {
            sendResponse(['error' => 'Montant requis pour une contre-offre.'], 400);
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                "SELECT n.*, i.seller_id, i.name AS item_name
                 FROM negotiations n
                 JOIN items i ON n.item_id = i.id
                 WHERE n.id = ? FOR UPDATE"
            );
            $stmt->execute([$nego_id]);
            $nego = $stmt->fetch();

            if (!$nego) {
                $pdo->rollBack();
                sendResponse(['error' => 'Négociation introuvable.'], 404);
            }
            if ($nego['status'] !== 'pending') {
                $pdo->rollBack();
                sendResponse(['error' => 'Cette négociation est déjà clôturée.'], 400);
            }
            if ($user_id !== (int)$nego['buyer_id'] && $user_id !== (int)$nego['seller_id']) {
                $pdo->rollBack();
                sendResponse(['error' => 'Accès non autorisé.'], 403);
            }

            // Vérification du tour et du compteur d'échanges
            $stmt = $pdo->prepare(
                "SELECT id, sender_id FROM negotiation_messages
                 WHERE negotiation_id = ? ORDER BY created_at DESC LIMIT 1"
            );
            $stmt->execute([$nego_id]);
            $last_msg = $stmt->fetch();

            if ($last_msg && (int)$last_msg['sender_id'] === $user_id) {
                $pdo->rollBack();
                sendResponse(['error' => "Ce n'est pas encore votre tour de répondre."], 400);
            }

            $stmt = $pdo->prepare(
                "SELECT COUNT(*) AS cnt FROM negotiation_messages WHERE negotiation_id = ?"
            );
            $stmt->execute([$nego_id]);
            $exchange_count = (int)$stmt->fetch()['cnt'];

            if ($action === 'counter' && $exchange_count >= 5) {
                $pdo->rollBack();
                sendResponse(['error' => "Limite de 5 échanges atteinte. Vous devez accepter ou refuser."], 400);
            }

            // Insérer le message
            $stmt = $pdo->prepare(
                "INSERT INTO negotiation_messages (negotiation_id, sender_id, type, amount, message)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$nego_id, $user_id, $action, $amount, $message]);

            // Mettre à jour le statut de la négociation
            $new_status  = $action === 'accept' ? 'accepted' : ($action === 'reject' ? 'rejected' : 'pending');
            $new_offer   = $action === 'counter' ? $amount : $nego['last_offer'];

            $stmt = $pdo->prepare("UPDATE negotiations SET status = ?, last_offer = ? WHERE id = ?");
            $stmt->execute([$new_status, $new_offer, $nego_id]);

            // Si acceptation, marquer l'article comme vendu
            if ($action === 'accept') {
                $stmt = $pdo->prepare("UPDATE items SET status = 'sold' WHERE id = ?");
                $stmt->execute([$nego['item_id']]);
            }

            $pdo->commit();

            // Notifier l'autre partie
            $other_id   = ($user_id === (int)$nego['buyer_id']) ? (int)$nego['seller_id'] : (int)$nego['buyer_id'];
            $item_name  = $nego['item_name'] ?? 'un article';
            $notif_msgs = [
                'accept'  => "Votre négociation pour l'article \"{$item_name}\" a été acceptée !",
                'reject'  => "Votre négociation pour l'article \"{$item_name}\" a été refusée.",
                'counter' => "Nouvelle contre-offre de " . number_format($amount, 2, ',', ' ') . " € pour l'article \"{$item_name}\"."
            ];
            addNotification($pdo, $other_id, $notif_msgs[$action]);

            $msg_map = [
                'accept'  => 'Négociation acceptée ! L\'article est maintenant marqué comme vendu.',
                'reject'  => 'Négociation refusée.',
                'counter' => "Contre-offre de " . number_format($amount, 2, ',', ' ') . " € envoyée."
            ];
            sendResponse([
                'success'        => true,
                'message'        => $msg_map[$action],
                'new_status'     => $new_status,
                'exchange_count' => $exchange_count + 1
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            sendResponse(['error' => 'Erreur serveur.'], 500);
        }
        break;

    case 'get_notifications':
        $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        if (!$user_id) {
            sendResponse(['error' => 'Utilisateur non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare(
                "SELECT id, message, is_read, created_at FROM notifications
                 WHERE user_id = ? ORDER BY created_at DESC LIMIT 30"
            );
            $stmt->execute([$user_id]);
            $notifications = $stmt->fetchAll();

            $unread = 0;
            foreach ($notifications as $n) {
                if (!(int)$n['is_read']) $unread++;
            }

            sendResponse(['notifications' => $notifications, 'unread' => $unread]);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
        break;

    case 'mark_notifications_read':
        $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
        if (!$user_id && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input   = json_decode(file_get_contents('php://input'), true);
            $user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;
        }
        if (!$user_id) {
            sendResponse(['error' => 'Utilisateur non spécifié.'], 400);
        }
        try {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
            $stmt->execute([$user_id]);
            sendResponse(['success' => true]);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Erreur BDD.'], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Action non reconnue'], 404);
        break;
}
?>
