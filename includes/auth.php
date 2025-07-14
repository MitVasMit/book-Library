<?php
session_start();

//for every page that requires login
function requireLogin()
{
    if (!isset($_SESSION['user'])) {
        header('Location: ../public/login.php');
        exit;
    }
}

//for admin pages
function requireAdmin()
{
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        $_SESSION['errors']['auth'] = "You don't have permission to view that page.";
        header('Location: ../public/index.php');
        exit;
    }
}
