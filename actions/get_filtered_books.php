<?php
header('Content-Type: application/json');
require_once '../includes/autoload.php';

try {
    $categories   = isset($_GET['categories']) ? (array)$_GET['categories'] : [];
    $newBooks     = isset($_GET['newBooks']) && $_GET['newBooks'] === '1';
    $ratingFilter = $_GET['ratingFilter'] ?? 'all';
    $minRating    = floatval($_GET['minRating'] ?? 0);
    $sortBy       = $_GET['sortBy'] ?? 'title';
    $sortOrder    = $_GET['sortOrder'] ?? 'asc';

    $sql = "SELECT b.*, c.name AS category_name 
            FROM books b 
            JOIN categories c ON b.category_id = c.id 
            WHERE b.deleted = 0";

    $params     = [];
    $conditions = [];

    if (!empty($categories)) {
        $placeholders = implode(',', array_fill(0, count($categories), '?'));
        $conditions[] = "b.category_id IN ($placeholders)";
        $params       = array_merge($params, $categories);
    }

    if ($newBooks) {
        $conditions[] = "b.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    }

    if ($ratingFilter === 'high') {
        $conditions[] = "b.rating >= 4.0";
    } elseif ($ratingFilter === 'low') {
        $conditions[] = "b.rating < 3.0";
    }

    if ($minRating > 0) {
        $conditions[] = "b.rating >= ?";
        $params[]     = $minRating;
    }

    if (!empty($conditions)) {
        $sql .= " AND " . implode(' AND ', $conditions);
    }

    $validSortFields = ['title', 'author', 'rating', 'created_at'];
    $sortBy   = in_array($sortBy, $validSortFields) ? $sortBy : 'title';
    $sortColumn = ($sortBy === 'date') ? 'created_at' : $sortBy;

    $sql .= " ORDER BY b.$sortColumn " . ($sortOrder === 'desc' ? 'DESC' : 'ASC');

    global $bookModel;
    $stmt = $bookModel->getConnection()->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($books);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load filtered books: ' . $e->getMessage()]);
}
