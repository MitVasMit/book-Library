<?php
require_once __DIR__ . '/../includes/autoload.php';
SecureSession::start();
include('../includes/header.php');
?>

<div class="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
    <div class="text-center mb-2 -mt-36">
    <img src="../assets/images/logo.png" alt="Library Logo" class="mx-auto h-12 w-auto mb-6">
    <h2 class="text-3xl font-extrabold text-blue-600 mb-4">Reset Your Password</h2>
    </div>
    
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-10 max-w-md w-full">

        <?php if (!empty($_SESSION['success'])): ?>
            <div class="mb-4 text-center text-green-600 dark:text-green-400 font-semibold">
                <?= $_SESSION['success']; ?>
            </div>
        <?php endif; ?>

        <form action="../actions/forgot_password_action.php" method="POST" class="space-y-6">
            <div>

                <div id="spinner" class="hidden flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>

                <label for="email" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Your Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    class="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['email']) ? $_SESSION['errors']['email'] : ''; ?></small>
            </div>

            <button
                type="submit"
                id="submitBtn"
                class="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-md font-semibold text-lg">
                Send Reset Link
            </button>
        </form>


        <p class="text-center mt-6 text-gray-600 dark:text-gray-300 text-sm">
            Remembered your password?
            <a href="login.php" class="text-blue-500 hover:underline font-medium">Back to Login</a>.
        </p>
    </div>
</div>

<?php include('../includes/footer.php');
unset($_SESSION['success'], $_SESSION['errors']);
?>