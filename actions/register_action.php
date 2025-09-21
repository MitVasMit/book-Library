<?php
require_once __DIR__ . '/../includes/autoload.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token first
    if (!CSRF::validatePostToken()) {
        $_SESSION['errors']['csrf'] = 'Invalid request. Please try again.';
        header('Location: ../public/register.php');
        exit;
    }
    
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    $errors = [];

    // simple validations, will make them stronger in the future
    if (strlen($name) < 3) {
        $errors['username'] = "Invalid Name, must be at least 3 characters long.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "Invalid email address.";
    }


    if ($password !== $confirm_password) {
        $errors['password_does_not_match'] = "Passwords do not match.";
    }
    if (strlen($password) < 6) {
        $errors['password'] = "Password must be at least 6 characters long.";
    }

    // check if Email-address exists in system
    if ($userModel->isEmailTaken($email)) {
        $errors['email'] = "An account using this email address already exists.";
    }

    if (empty($errors)) {
        // password hash
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // user register
        if ($userModel->createUser($name, $email, $passwordHash)) {
            // successfull, go to login page
            $_SESSION['success'] = "Registration successful! Please log in.";
            header('Location: ../public/login.php');
            exit;
        } else {
            $errors['failed_register'] = "Failed to save user. Please try again.";
        }
    }
    // return with errors
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = ['name' => $name, 'email' => $email];

    header('Location: ../public/register.php');
    exit;
} else {
    // if not POST method, back to register.php
    header('Location: ../public/register.php');
    exit;
}
