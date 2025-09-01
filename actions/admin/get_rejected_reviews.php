<?php
require_once '../../includes/autoload.php';
require_once '../../includes/auth.php';

requireAdmin();

header('Content-Type: application/json');

try {
    $reviewModel = new Review();
    $rejectedReviews = $reviewModel->getRejectedReviews();
    
    echo json_encode([
        'success' => true,
        'reviews' => $rejectedReviews
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
