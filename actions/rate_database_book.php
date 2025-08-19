<?php
header('Content-Type: application/json');
require_once '../includes/autoload.php';
require_once '../includes/auth.php';

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Please log in to rate this book']);
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }
    
    // Validate required fields
    $bookId = $input['book_id'] ?? null;
    $rating = $input['rating'] ?? null;
    
    if (!$bookId || !$rating) {
        http_response_code(400);
        echo json_encode(['error' => 'Book ID and rating are required']);
        exit;
    }
    
    // Validate rating range (1-5)
    if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Rating must be between 1 and 5']);
        exit;
    }
    
    // Check if book exists in database
    $bookModel = new Book();
    $book = $bookModel->getById($bookId);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode(['error' => 'Book not found in our database']);
        exit;
    }
    
    // Save the rating
    $ratingModel = new Rating();
    $userId = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? null;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID not found in session']);
        exit;
    }
    
    $success = $ratingModel->createRating($userId, $bookId, $rating);
    
    if ($success) {
        // Get updated rating data
        $ratingData = $ratingModel->getBookRatingWithUser($bookId, $userId);
        
        echo json_encode([
            'success' => true,
            'message' => 'Rating saved successfully!',
            'average_rating' => $ratingData['average_rating'],
            'total_ratings' => $ratingData['total_ratings'],
            'user_rating' => $ratingData['user_rating']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save rating']);
    }
    
} catch (Exception $e) {
    error_log('Rating error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
