<?php
require_once '../includes/autoload.php';
SecureSession::start();

header('Content-Type: application/json');

$bookId = (int)($_GET['book_id'] ?? 0);

if (!$bookId) {
    http_response_code(400);
    echo json_encode(['error' => 'Book ID is required']);
    exit;
}

try {
    $reviewModel = new Review();
    $reviews = $reviewModel->getApprovedReviews($bookId);
    
    echo json_encode([
        'success' => true,
        'reviews' => $reviews
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
