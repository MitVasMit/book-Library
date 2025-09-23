<?php
require_once __DIR__ . '/../includes/autoload.php';
SecureSession::start();
include('../includes/header.php');

?>

<div class="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
    <div class="text-center mb-2 -mt-36">
        <img src="../assets/images/logo.png" alt="Library Logo" class="mx-auto h-12 w-auto mb-6">
        <h2 class="text-3xl font-extrabold text-blue-600 mb-4">Log In</h2>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-10 max-w-md w-full">

        <div class="mb-2 p-3 text-center text-bold text-green-300 rounded-md">
            <?= !empty($_SESSION['success']) ? $_SESSION['success'] : ''; ?>
        </div>

        <small class="mb-2 block text-center text-base font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['login']) ? $_SESSION['errors']['login'] : ''; ?></small>

        <small class="mb-2 block text-center text-base font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['csrf']) ? $_SESSION['errors']['csrf'] : ''; ?></small>

        <small class="mb-2 block text-center text-base font-semibold text-orange-600 dark:text-orange-400">
            <?php 
            if (isset($_GET['timeout']) && $_GET['timeout'] == '1') {
                echo 'Your session has expired due to inactivity. Please log in again.';
            } elseif (!empty($_SESSION['timeout_message'])) {
                echo $_SESSION['timeout_message'];
            }
            ?>
        </small>

        <form action="../actions/login_action.php" method="POST" class="space-y-6">
            <?= CSRF::getTokenField() ?>
            <div>
                <label for="email" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"`
                    value="<?= htmlspecialchars($_SESSION['old']['email'] ?? '') ?>"
                    class="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['email']) ? $_SESSION['errors']['email'] : ''; ?></small>
            </div>

            <div>
                <label for="password" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    class="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <a href="forgot_password.php" class="block text-right text-blue-600 hover:underline mt-4">Forgot your password?</a>
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['password']) ? $_SESSION['errors']['password'] : ''; ?></small>
            </div>

            <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-md font-semibold text-lg">
                Log In
            </button>

        </form>

        <p class="text-center mt-6 text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?
            <a href="register.php" class="text-blue-500 hover:underline font-medium">Register here</a>.
        </p>
    </div>
</div>




<?php include('../includes/footer.php');
unset($_SESSION['success'], $_SESSION['errors'], $_SESSION['timeout_message']);
