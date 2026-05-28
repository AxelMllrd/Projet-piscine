<?php
require_once 'config.php';

// Routeur basique
$action = isset($_GET['action']) ? $_GET['action'] : 'status';

switch ($action) {
    case 'status':
        sendResponse(['status' => 'ok', 'message' => 'API Mercato Nova est en ligne']);
        break;
    
    case 'items':
        // Simulation de données pour le matériel de voile
        $mock_items = [
            [
                'id' => 1,
                'name' => 'Wing Foil Fanatic Sky Wing',
                'description' => 'Planche de wing foil 5\'4" en excellent état, idéale pour débuter et progresser.',
                'category' => 'wingfoil',
                'item_condition' => 'used',
                'price' => 750.00,
                'sale_type' => 'immediate',
                'image_url' => 'https://images.unsplash.com/photo-1629207431449-34752c1e7960?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 2,
                'name' => 'Windsurf Goya Nexus 2024',
                'description' => 'Voile de windsurf freeride performante, stable et légère. Neuve sous blister.',
                'category' => 'windsurf',
                'item_condition' => 'new',
                'price' => 890.00,
                'sale_type' => 'immediate',
                'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 3,
                'name' => 'Kitesurf North Reach 9m',
                'description' => 'Aile de kite polyvalente pour tout faire. Un accro réparé par un pro.',
                'category' => 'kitesurf',
                'item_condition' => 'used',
                'price' => 620.00,
                'sale_type' => 'auction',
                'image_url' => 'https://images.unsplash.com/photo-1502933691298-84fa1463ec83?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 4,
                'name' => 'Surf Pyzel Ghost 6\'0"',
                'description' => 'La planche mythique de John John Florence. Superbe shape pour vagues creuses.',
                'category' => 'surf',
                'item_condition' => 'new',
                'price' => 780.00,
                'sale_type' => 'negotiation',
                'image_url' => 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800'
            ],
            [
                'id' => 5,
                'name' => 'Windfoil NeilPryde Glide Surf',
                'description' => 'Foil complet en carbone. Très peu servi.',
                'category' => 'windfoil',
                'item_condition' => 'used',
                'price' => 950.00,
                'sale_type' => 'immediate',
                'image_url' => 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?auto=format&fit=crop&q=80&w=800'
            ]
        ];
        sendResponse($mock_items);
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
        // Simulation d'une offre (En conditions réelles, on utiliserait $_POST et des transactions PDO)
        $auction_id = $_GET['id'] ?? 0;
        $amount = $_GET['amount'] ?? 0;
        $user_id = 101; // ID utilisateur simulé (pourrait être récupéré via $_SESSION)

        // Logique de validation simulée
        if ($amount <= 620.00) {
            sendResponse(['error' => 'L\'offre doit être supérieure à l\'enchère actuelle'], 400);
        }

        // En conditions réelles :
        /*
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("SELECT current_bid, end_time, status FROM auctions WHERE id = ? FOR UPDATE");
            $stmt->execute([$auction_id]);
            $auction = $stmt->fetch();
            
            if ($auction['status'] !== 'active' || strtotime($auction['end_time']) < time()) {
                throw new Exception("Enchère terminée");
            }
            if ($amount <= $auction['current_bid']) {
                throw new Exception("Offre insuffisante");
            }

            // Update auction
            $stmt = $pdo->prepare("UPDATE auctions SET current_bid = ?, highest_bidder_id = ? WHERE id = ?");
            $stmt->execute([$amount, $user_id, $auction_id]);

            // Insert into history
            $stmt = $pdo->prepare("INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)");
            $stmt->execute([$auction_id, $user_id, $amount]);

            $pdo->commit();
            sendResponse(['message' => 'Offre placée avec succès !']);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(['error' => $e->getMessage()], 400);
        }
        */
        sendResponse(['message' => 'Offre de ' . $amount . ' € placée avec succès !']);
        break;

    default:
        sendResponse(['error' => 'Action non reconnue'], 404);
        break;
}
?>
