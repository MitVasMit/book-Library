<?php
header('Content-Type: application/json');
require_once '../includes/autoload.php';
SecureSession::start();
require_once '../includes/auth.php';

try {
    $bookId = $_GET['book_id'] ?? null;
    
    if (!$bookId) {
        http_response_code(400);
        echo json_encode(['error' => 'Book ID is required']);
        exit;
    }
    
    $bookModel = new Book();
    $book = $bookModel->getById($bookId);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['error' => 'Book not found in our database']);
        exit;
    }
    
    $ratingModel = new Rating();
    $userId = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? null;
    $ratingData = $ratingModel->getBookRatingWithUser($bookId, $userId);
    
    echo json_encode([
        'success' => true,
        'average_rating' => $ratingData['average_rating'],
        'total_ratings' => $ratingData['total_ratings'],
        'user_rating' => $ratingData['user_rating']
    ]);
    
} catch (Exception $e) {
    error_log('Get rating error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
