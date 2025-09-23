<?php
//for every page that requires login
function requireLogin()
{
    if (!SecureSession::isLoggedIn()) {
        header('Location: ../public/login.php');
        exit;
    }
}

//for admin pages
function requireAdmin()
{
    if (!SecureSession::isLoggedIn()) {
        header('Location: ../public/login.php');
        exit;
    }
    
    $user = SecureSession::getCurrentUser();
    if ($user['role'] !== 'admin') {
        $_SESSION['errors']['auth'] = "You don't have permission to view that page.";
        header('Location: ../public/index.php');
        exit;
    }
}
