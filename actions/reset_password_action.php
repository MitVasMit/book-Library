<?php
require_once __DIR__ . '/../includes/autoload.php';

SecureSession::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../public/login.php');
    exit;
}

$token = $_POST['token'] ?? '';
$newPassword = $_POST['new_password'] ?? '';
$confirmPassword = $_POST['confirm_password'] ?? '';

// simple validations
if (empty($token)) {
    $_SESSION['errors']['token'] = 'Invalid or missing token.';
    header('Location: ../public/login.php');
    exit;
}

if (empty($newPassword) || empty($confirmPassword)) {
    $_SESSION['errors']['password'] = 'Both password fields are required.';
    header("Location: ../public/reset_password.php?token=" . urlencode($token));
    exit;
}

if ($newPassword !== $confirmPassword) {
    $_SESSION['errors']['password'] = 'Passwords do not match.';
    header("Location: ../public/reset_password.php?token=" . urlencode($token));
    exit;
}

// validate token and get associated email using User model method
$reset = $userModel->getEmailByValidToken($token);

if (!$reset) {
    $_SESSION['errors']['token'] = 'Reset token is invalid or has expired.';
    header('Location: ../public/login.php');
    exit;
}

$email = $reset['email'];

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

if (!$userModel->updatePasswordByEmail($email, $hashedPassword)) {
    $_SESSION['errors']['password'] = 'Failed to update password. Please try again.';
    header("Location: ../public/reset_password.php?token=" . urlencode($token));
    exit;
}

// delete the used token from db
$userModel->deleteResetTokenByEmail($email);

$_SESSION['success'] = 'Your password has been reset successfully. You can now login with your new password.';
header('Location: ../public/login.php');
exit;
