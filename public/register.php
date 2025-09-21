<?php
require_once __DIR__ . '/../includes/autoload.php';
include('../includes/header.php');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

?>

<div class="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
    <div class="text-center mb-2 -mt-24">
        <img src="../assets/images/logo.png" alt="Library Logo" class="mx-auto h-12 w-auto mb-6">
        <h2 class="text-3xl font-extrabold text-blue-600 mb-4">Create Your Account</h2>
    </div>
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-10 max-w-md w-full">
        <small class="mb-2 block text-center text-base font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['csrf']) ? $_SESSION['errors']['csrf'] : ''; ?></small>

        <form action="../actions/register_action.php" method="POST" class="space-y-6">
            <?= CSRF::getTokenField() ?>

            <div>
                <label for="name" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value="<?= htmlspecialchars($_SESSION['old']['name'] ?? '') ?>"
                    class="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['username']) ? $_SESSION['errors']['username'] : ''; ?></small>
            </div>

            <div>
                <label for="email" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
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
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['password']) ? $_SESSION['errors']['password'] : ''; ?></small>
            </div>

            <div>
                <label for="confirm_password" class="block mb-1 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
                <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Repeat password"
                    class="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <small class="mt-2 block font-semibold text-red-700 dark:text-red-300"><?= !empty($_SESSION['errors']['password_does_not_match']) ? $_SESSION['errors']['password_does_not_match'] : ''; ?></small>

            </div>

            <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded-md font-semibold text-lg">
                Register
            </button>
        </form>

        <p class="text-center mt-6 text-gray-600 dark:text-gray-300 text-sm">
            Already have an account?
            <a href="login.php" class="text-blue-500 hover:underline font-medium">Log in here</a>.
        </p>
    </div>
</div>

<?php include('../includes/footer.php');
unset($_SESSION['errors'], $_SESSION['old']);
?>