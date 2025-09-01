<?php
header('Content-Type: application/json');

require_once '../includes/autoload.php';
require_once '../includes/auth.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$bookId = (int)($input['book_id'] ?? 0);
$rating = (int)($input['rating'] ?? 0);
$comment = trim($input['comment'] ?? '');

if (!$bookId || $rating < 1 || $rating > 5 || empty($comment)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

try {
    $bookModel = new Book();
    $book = $bookModel->getById($bookId);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['error' => 'Book not found in database']);
        exit;
    }

    $reviewModel = new Review();
    
    $existingReview = $reviewModel->getUserReview($_SESSION['user_id'], $bookId);
    
    if ($existingReview) {
        $success = $reviewModel->updateReview($existingReview['id'], $rating, $comment);
        $message = 'Review updated successfully! It will be reviewed by admin.';
    } else {
        $success = $reviewModel->createReview($_SESSION['user_id'], $bookId, $rating, $comment);
        $message = 'Review submitted successfully! It will be reviewed by admin.';
    }
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => $message
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save review']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
