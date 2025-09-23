<?php
require_once __DIR__ . '/../includes/autoload.php';

SecureSession::start();
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$bookModel = new Book();
$favoriteModel = new Favorite();
$privateCommentModel = new PrivateComment();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['book_id']) || !isset($input['comment'])) {
        throw new Exception('Book ID and comment are required');
    }
    
    $bookId = (int)$input['book_id'];
    $comment = trim($input['comment']);
    $userId = $_SESSION['user']['id'];
    
    if (empty($comment)) {
        throw new Exception('Comment cannot be empty');
    }
    
    if (strlen($comment) > 1000) {
        throw new Exception('Comment is too long (max 1000 characters)');
    }
    
    $book = $bookModel->getById($bookId);
    if (!$book) {
        throw new Exception('Book not found');
    }
    
    if ($privateCommentModel->addComment($userId, $bookId, $comment)) {
        // Also add the book to user's favorites if not already there
        $favoriteAdded = false;
        try {
            if (!$favoriteModel->isFavorited($userId, $bookId)) {
                if ($favoriteModel->addFavorite($userId, $bookId)) {
                    $favoriteAdded = true;
                    error_log("Book $bookId automatically added to favorites for user $userId");
                } else {
                    error_log("Failed to add book $bookId to favorites for user $userId");
                }
            } else {
                error_log("Book $bookId already in favorites for user $userId");
            }
        } catch (Exception $e) {
            error_log("Error handling favorites for user $userId, book $bookId: " . $e->getMessage());
        }
        
        $newComment = $privateCommentModel->getUserComment($userId, $bookId);
        
        $response = [
            'success' => true,
            'message' => 'Comment added successfully',
            'comment' => [
                'id' => $newComment['id'],
                'comment' => $comment,
                'created_at' => $newComment['created_at']
            ]
        ];
        
        if ($favoriteAdded) {
            $response['favorite_added'] = true;
            $response['message'] = 'Comment added successfully and book added to favorites';
        }
        
        echo json_encode($response);
    } else {
        error_log("Failed to add private comment for user $userId, book $bookId");
        throw new Exception('Failed to add comment. Please try again.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
