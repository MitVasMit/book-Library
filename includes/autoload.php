<?php

// echo __DIR__;
require_once __DIR__ . '/classes/database.php';
require_once __DIR__ . '/classes/user.php';
require_once __DIR__ . '/classes/book.php';
require_once __DIR__ . '/classes/category.php';
require_once __DIR__ . '/classes/rating.php';
// require_once __DIR__ . '/classes/author.php';
// require_once __DIR__ . '/classes/comment.php';
// require_once __DIR__ . '/classes/private-note.php';

// Instanzen initialisieren (optional hier oder im jeweiligen Skript)
$userModel = new User();
$bookModel = new Book();
$categoryModel = new Category();
// $authorModel = new Author();
// $commentModel = new Comment();
// $privateNoteModel = new PrivateNote();
