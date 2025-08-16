<?php
require_once '../includes/auth.php';
require_once '../includes/autoload.php';
requireAdmin();
include('../includes/header.php');

$bookModel = new Book();
$userModel = new User();

$totalBooks = count($bookModel->getAllWithCategory());
$totalUsers = count($userModel->getAllUsers());
$totalReviews = 0; 
$recentBooksList = array_slice($bookModel->getAllWithCategory(), 0, 5);
$recentUsers = array_slice($userModel->getAllUsers(), 0, 5);

?>

<div class="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
    <?php include_once '../includes/admin/admin_nav.php'; ?>

    <main class="flex-1 p-6">
        <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                        <i class="fas fa-book text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Books</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white"><?= $totalBooks ?></p>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
                        <i class="fas fa-users text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white"><?= $totalUsers ?></p>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <i class="fas fa-star text-yellow-600 dark:text-yellow-400 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white"><?= $totalReviews ?></p>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                        <i class="fas fa-plus text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
                <div class="space-y-3">
                    <a href="books.php" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <i class="fas fa-book text-blue-600 dark:text-blue-400 mr-3"></i>
                        <span>Manage Books</span>
                    </a>
                    <a href="categories.php" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <i class="fas fa-layer-group text-green-600 dark:text-green-400 mr-3"></i>
                        <span>Book Categories</span>
                    </a>
                    <a href="comments.php" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <i class="fas fa-user-lock text-yellow-600 dark:text-yellow-400 mr-3"></i>
                        <span>Private Comments</span>
                    </a>
                    <a href="reviews.php" class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <i class="fas fa-star text-purple-600 dark:text-purple-400 mr-3"></i>
                        <span>Reviews</span>
                    </a>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-4">Recent Books</h2>
                <div class="space-y-3">
                    <?php if (empty($recentBooksList)): ?>
                        <p class="text-gray-500 dark:text-gray-400">No books added yet.</p>
                    <?php else: ?>
                        <?php foreach ($recentBooksList as $book): ?>
                            <div class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded mr-3 flex items-center justify-center">
                                    <i class="fas fa-book text-gray-500 dark:text-gray-400"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium"><?= htmlspecialchars($book['title']) ?></p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Added -</p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div class="mt-6 bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Recent Users</h2>
            <div class="space-y-3">
                <?php if (empty($recentUsers)): ?>
                    <p class="text-gray-500 dark:text-gray-400">No users registered yet.</p>
                <?php else: ?>
                    <?php foreach ($recentUsers as $user): ?>
                        <div class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                                <i class="fas fa-user text-gray-500 dark:text-gray-400"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium"><?= htmlspecialchars($user['name']) ?></p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Joined -</p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </main>
</div>

<?php include('../includes/footer.php'); ?>