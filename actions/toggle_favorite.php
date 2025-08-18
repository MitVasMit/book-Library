<?php
session_start();
require_once __DIR__ . '/../includes/autoload.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$bookId = $input['book_id'] ?? null;
$action = $input['action'] ?? null; // 'add' or 'remove'

if (!$bookId || !in_array($action, ['add', 'remove'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit;
}

$userId = $_SESSION['user']['id'];

try {
    if ($action === 'add') {
        $result = $favoriteModel->addFavorite($userId, $bookId);
        $message = 'Book added to favorites';
    } else {
        $result = $favoriteModel->removeFavorite($userId, $bookId);
        $message = 'Book removed from favorites';
    }

    if ($result) {
        $isFavorited = $favoriteModel->isFavorited($userId, $bookId);
        $favoriteCount = $favoriteModel->getFavoriteCount($userId);
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'is_favorited' => $isFavorited,
            'favorite_count' => $favoriteCount
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update favorites'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
