<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../includes/autoload.php';

require_once __DIR__ . '/../../includes/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $bookId = (int)$_POST['id'];
    try {
        if ($bookModel->softDelete($bookId)) {
            $_SESSION['success'] = 'Book has been deleted (soft delete).';
        } else {
            $_SESSION['error'] = 'Failed to delete book.';
        }
    } catch (Exception $e) {
        $_SESSION['error'] = 'Error: ' . $e->getMessage();
    }
} else {
    $_SESSION['error'] = 'Invalid request.';
}
header('Location: /book-Library/admin/books.php');
exit(); 