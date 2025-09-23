<?php
require_once '../includes/autoload.php';
SecureSession::start();

header('Content-Type: application/json');

try {
    if (!isset($_GET['book_id'])) {
        throw new Exception('Book ID is required');
    }
    
    $bookId = intval($_GET['book_id']);
    
    if ($bookId <= 0) {
        throw new Exception('Invalid book ID');
    }
    
    $favorite = new Favorite();
    $favoriteCount = $favorite->getBookFavoriteCount($bookId);
    
    echo json_encode([
        'success' => true,
        'favorite_count' => $favoriteCount
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
