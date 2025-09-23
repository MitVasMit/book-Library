<?php
header('Content-Type: application/json');

require_once '../includes/autoload.php';
SecureSession::start();
require_once '../includes/auth.php';
requireLogin(); 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$bookKey = $input['book_key'] ?? '';
$bookTitle = $input['book_title'] ?? '';
$bookAuthor = $input['book_author'] ?? '';
$rating = (int)($input['rating'] ?? 0);

if (!$bookKey || !$bookTitle || !$bookAuthor || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

try {
    $ratingModel = new Rating();
    $success = $ratingModel->createRating($_SESSION['user_id'], $bookKey, $rating);
    
    if ($success) {
        $avgRating = $ratingModel->getBookRating($bookKey);
        echo json_encode([
            'success' => true,
            'message' => 'Rating saved successfully',
            'average_rating' => $avgRating['average_rating'],
            'total_ratings' => $avgRating['total_ratings']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save rating']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} 