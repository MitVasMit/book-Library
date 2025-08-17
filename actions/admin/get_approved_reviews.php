<?php
require_once '../../includes/autoload.php';
require_once '../../includes/auth.php';

// Ensure user is admin
requireAdmin();

header('Content-Type: application/json');

try {
    $reviewModel = new Review();
    $approvedReviews = $reviewModel->getApprovedReviews();
    
    echo json_encode([
        'success' => true,
        'reviews' => $approvedReviews
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
