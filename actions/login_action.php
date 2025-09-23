<?php
require_once __DIR__ . '/../includes/autoload.php';

SecureSession::start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token first
    if (!CSRF::validatePostToken()) {
        $_SESSION['errors']['csrf'] = 'Invalid request. Please try again.';
        header('Location: ../public/login.php');
        exit;
    }
    
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $errors = [];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Please enter a valid email address.";
    }

    if (empty($password)) {
        $errors['password'] = "Please enter your password.";
    }

    if (empty($errors)) {
        $user = $userModel->authenticate($email, $password);

        if (!$user) {
            $errors['login'] = "Invalid email or password.";
        } else {
            $_SESSION['user'] = $user;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            
            SecureSession::regenerate();
            
            CSRF::regenerateToken();

            if ($user['role'] === 'admin') {
                header('Location: ../admin/dashboard.php');
            } else {
                header('Location: ../public/index.php');
            }
            exit;
        }
    }

    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = ['email' => $email];
    header('Location: ../public/login.php');
    exit;
} else {
    header('Location: ../public/login.php');
    exit;
}
