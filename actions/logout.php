<?php
require_once __DIR__ . '/../includes/autoload.php';

// Start secure session
SecureSession::start();

// Destroy the secure session (clears all data and removes cookie)
SecureSession::destroy();

header('Location: ../public/login.php');
exit;
