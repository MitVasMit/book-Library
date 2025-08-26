<?php
require_once __DIR__ . '/../includes/autoload.php';

// Security check - require login
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    if (!isset($_GET['book_id'])) {
        throw new Exception('Book ID is required');
    }
    
    $bookId = (int)$_GET['book_id'];
    $userId = $_SESSION['user']['id'];
    
    // Verify book exists
    $book = $bookModel->getById($bookId);
    if (!$book) {
        throw new Exception('Book not found');
    }
    
    // Get user's comment for this book
    $comment = $privateCommentModel->getUserComment($userId, $bookId);
    
    if ($comment) {
        echo json_encode([
            'success' => true,
            'comment' => $comment
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'comment' => null
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
