<?php
require_once '../includes/autoload.php';
SecureSession::start();

header('Content-Type: application/json');

try {
    $categories = $categoryModel->getAll();
    echo json_encode($categories);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load categories: ' . $e->getMessage()]);
}
