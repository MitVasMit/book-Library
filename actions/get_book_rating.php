<?php
header('Content-Type: application/json');

require_once '../includes/autoload.php';
SecureSession::start();

$bookKey = $_GET['book_key'] ?? '';

if (!$bookKey) {
    http_response_code(400);
    echo json_encode(['error' => 'Book key is required']);
    exit;
}

try {
    $ratingModel = new Rating();
    $avgRating = $ratingModel->getBookRating($bookKey);
    $userRating = null;
    
    if (isset($_SESSION['user_id'])) {
        $userRating = $ratingModel->getUserRating($_SESSION['user_id'], $bookKey);
    }
    
    echo json_encode([
        'average_rating' => $avgRating['average_rating'],
        'total_ratings' => $avgRating['total_ratings'],
        'user_rating' => $userRating
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} 