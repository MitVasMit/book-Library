<?php
header('Content-Type: application/json');

require_once '../../includes/autoload.php';
require_once '../../includes/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$reviewId = (int)($input['review_id'] ?? 0);

if (!$reviewId) {
    http_response_code(400);
    echo json_encode(['error' => 'Review ID is required']);
    exit;
}

try {
    $reviewModel = new Review();
    $success = $reviewModel->approveReview($reviewId);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Review approved successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to approve review']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
