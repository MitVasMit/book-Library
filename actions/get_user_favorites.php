<?php
require_once __DIR__ . '/../includes/autoload.php';
SecureSession::start();

header('Content-Type: application/json');

if (!SecureSession::isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Session expired', 'redirect' => '/book-Library/public/login.php']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$user = SecureSession::getCurrentUser();
$userId = $user['id'];

try {
    $favorites = $favoriteModel->getUserFavorites($userId);
    $favoriteCount = $favoriteModel->getFavoriteCount($userId);
    
    echo json_encode([
        'success' => true,
        'favorites' => $favorites,
        'favorite_count' => $favoriteCount
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
