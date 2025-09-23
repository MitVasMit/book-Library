<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

require_once __DIR__ . '/../includes/autoload.php';
require_once __DIR__ . '/../utils/Mailer.php';

SecureSession::start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../public/forgot_password.php');
    exit;
}

$email = trim($_POST['email'] ?? '');

if (empty($email)) {
    $_SESSION['errors']['email'] = 'Email is required.';
    header('Location: ../public/forgot_password.php');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION['errors']['email'] = 'Invalid email address.';
    header('Location: ../public/forgot_password.php');
    exit;
}

if (!$userModel->emailExists($email)) {
    $_SESSION['success'] = 'If this email exists in our system, a reset link has been sent.';
    header('Location: ../public/forgot_password.php');
    exit;
}

$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 900); // 15 min from now

$userModel->storePasswordResetToken($email, $token, $expires);

$mailer = new Mailer();

$resetLink = "http://localhost/book-Library/public/reset_password.php?token=$token";

$subject = "Password Reset Request";
$body = "
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password:</p>
    <a href='$resetLink'>$resetLink</a>
    <p>This link will expire in 15 min.</p>
";

$mailer->send($email, $subject, $body);

$_SESSION['success'] = 'If this email exists in our system, a reset link has been sent.';
header('Location: ../public/forgot_password.php');
exit;
