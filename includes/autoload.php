<?php

// Load Composer autoloader first
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables from .env file
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

// echo __DIR__;
require_once __DIR__ . '/classes/database.php';
require_once __DIR__ . '/classes/user.php';
require_once __DIR__ . '/classes/book.php';
require_once __DIR__ . '/classes/category.php';
require_once __DIR__ . '/classes/rating.php';
require_once __DIR__ . '/classes/review.php';
require_once __DIR__ . '/classes/favorite.php';
require_once __DIR__ . '/classes/private_comment.php';
require_once __DIR__ . '/classes/csrf.php';
require_once __DIR__ . '/classes/secure_session.php';
// require_once __DIR__ . '/classes/author.php';
// require_once __DIR__ . '/classes/comment.php';
// require_once __DIR__ . '/classes/private-note.php';

// Instanzen initialisieren (optional hier oder im jeweiligen Skript)
$userModel = new User();
$bookModel = new Book();
$categoryModel = new Category();
$favoriteModel = new Favorite();
$privateCommentModel = new PrivateComment();
// $authorModel = new Author();
// $commentModel = new Comment();
// $privateNoteModel = new PrivateNote();
