<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../includes/autoload.php';

SecureSession::start();
require_once __DIR__ . '/../../includes/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /book-Library/admin/books.php');
    exit();
}

// Validate CSRF token first
if (!CSRF::validatePostToken()) {
    $_SESSION['error'] = 'Invalid request. Please try again.';
    header('Location: /book-Library/admin/books.php');
    exit();
}

try {
    $required_fields = ['title', 'author', 'category_id'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Field '$field' is required.");
        }
    }

    $title = trim($_POST['title']);
    $author = trim($_POST['author']);
    $description = trim($_POST['description'] ?? '');
    $published_year = !empty($_POST['published_year']) ? (int)$_POST['published_year'] : null;
    $pages = !empty($_POST['pages']) ? (int)$_POST['pages'] : null;
    $rating = !empty($_POST['rating']) ? (float)$_POST['rating'] : 0.0;
    $category_id = (int)$_POST['category_id'];

    if (strlen($title) > 255) {
        throw new Exception("Title is too long (max 255 characters).");
    }
    if (strlen($author) > 255) {
        throw new Exception("Author name is too long (max 255 characters).");
    }
    if ($published_year && ($published_year < 1000 || $published_year > date('Y') + 1)) {
        throw new Exception("Invalid published year.");
    }
    if ($pages && $pages < 1) {
        throw new Exception("Pages must be a positive number.");
    }
    if ($rating < 0 || $rating > 5) {
        throw new Exception("Rating must be between 0 and 5.");
    }

    $cover_image = null;
    if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['cover_image'];
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $max_size = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowed_types)) {
            throw new Exception("Invalid file type. Only JPG, PNG, and GIF are allowed.");
        }

        if ($file['size'] > $max_size) {
            throw new Exception("File is too large. Maximum size is 5MB.");
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $upload_path = __DIR__ . '/../../uploads/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
            throw new Exception("Failed to upload file.");
        }

        $cover_image = $filename;
    }

    $result = $bookModel->create([
        'title' => $title,
        'author' => $author,
        'description' => $description,
        'published_year' => $published_year,
        'pages' => $pages,
        'rating' => $rating,
        'cover_image' => $cover_image,
        'category_id' => $category_id
    ]);

    if ($result) {
        $_SESSION['success'] = "Book '$title' has been added successfully!";
    } else {
        throw new Exception("Failed to add book to database.");
    }

} catch (Exception $e) {
    $_SESSION['error'] = $e->getMessage();
    
    if (isset($cover_image) && file_exists(__DIR__ . '/../../uploads/' . $cover_image)) {
        unlink(__DIR__ . '/../../uploads/' . $cover_image);
    }
}

header('Location: /book-Library/admin/books.php');
exit(); 