<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();
session_start();

// Security check - require admin access
require_once __DIR__ . '/../includes/auth.php';
requireAdmin();

include('../includes/header.php');
require_once __DIR__ . '/../includes/autoload.php';
$books = $bookModel->getAllWithCategory();

$categories = $categoryModel->getAll();
?>

<div class="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
    <?php include_once '../includes/admin/admin_nav.php'; ?>

    <main class="flex-1 p-6">
        <?php if (isset($_SESSION['success'])): ?>
            <div class="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
                <?= htmlspecialchars($_SESSION['success']) ?>
                <?php unset($_SESSION['success']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error'])): ?>
            <div class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                <?= htmlspecialchars($_SESSION['error']) ?>
                <?php unset($_SESSION['error']); ?>
            </div>
        <?php endif; ?>

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Manage Books</h1>
            <button id="addBookBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <i class="fas fa-plus"></i>
                Add New Book
            </button>
        </div>

        <div id="addBookModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Add New Book</h2>
                    <button id="closeModal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
                </div>

                <form id="addBookForm" action="../actions/admin/add_book.php" method="POST" enctype="multipart/form-data" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                            <input type="text" id="title" name="title" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>

                        <div>
                            <label for="author" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author *</label>
                            <input type="text" id="author" name="author" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="description" name="description" rows="4"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="published_year" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Published Year</label>
                            <input type="number" id="published_year" name="published_year" min="1000" max="<?= date('Y') + 1 ?>"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>

                        <div>
                            <label for="pages" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages</label>
                            <input type="number" id="pages" name="pages" min="1"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>

                        <div>
                            <label for="rating" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                            <input type="number" id="rating" name="rating" min="0" max="5" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                            <select id="category_id" name="category_id" required
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="">Select a category</option>
                                <?php foreach ($categories as $category): ?>
                                    <option value="<?= $category['id'] ?>"><?= htmlspecialchars($category['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div>
                            <label for="cover_image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
                            <input type="file" id="cover_image" name="cover_image" accept="image/*"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Accepted formats: JPG, PNG, GIF. Max size: 5MB</p>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" id="cancelBtn" class="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Add Book
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Active books (<?= count(array_filter($books, function($b){return !$b['deleted'];})) ?>)</h3>
                <div class="flex gap-2">
                    <input type="text" id="searchBooks" placeholder="Search books..."
                        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white">
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
                <?php foreach ($books as $book): ?>
                    <?php if (!$book['deleted']): ?>
                        <div class="book-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full">
                            <div class="relative p-3">
                                <img src="/book-Library/uploads/<?= htmlspecialchars($book['cover_image'] ?: 'default-cover.jpg') ?>"
                                     alt="Cover" class="w-full h-32 object-contain rounded-lg bg-gray-100 dark:bg-gray-600">
                                <div class="absolute top-3 right-3 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded">
                                    <?= number_format($book['rating'], 1) ?> ★
                                </div>
                            </div>
                            <div class="p-3">
                                <h4 class="font-semibold text-gray-800 dark:text-white text-xs mb-1 truncate" title="<?= htmlspecialchars($book['title']) ?>">
                                    <?= htmlspecialchars($book['title']) ?>
                                </h4>
                                <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 truncate" title="<?= htmlspecialchars($book['author']) ?>">
                                    <?= htmlspecialchars($book['author']) ?>
                                </p>
                                <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded mb-3">
                                    <?= htmlspecialchars($book['category_name']) ?>
                                </span>
                                <div class="flex gap-1.5">
                                    <a href="edit_book.php?id=<?= $book['id'] ?>"
                                       class="flex-1 text-center text-xs bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-1 rounded transition-colors">
                                        <i class="fas fa-edit mr-1"></i>Edit
                                    </a>
                                    <button onclick="deleteBook(<?= $book['id'] ?>)"
                                            class="flex-1 text-center text-xs bg-red-500 hover:bg-red-600 text-white px-1.5 py-1 rounded transition-colors">
                                        <i class="fas fa-trash mr-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mt-8">Not active books (<?= count(array_filter($books, function($b){return $b['deleted'];})) ?>)</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
            <?php foreach ($books as $book): ?>
                <?php if ($book['deleted']): ?>
                    <div class="book-card bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full opacity-70">
                        <div class="relative p-3">
                            <img src="/book-Library/uploads/<?= htmlspecialchars($book['cover_image'] ?: 'default-cover.jpg') ?>"
                                 alt="Cover" class="w-full h-32 object-contain rounded-lg bg-gray-100 dark:bg-gray-600">
                        </div>
                        <div class="p-3">
                            <h4 class="font-semibold text-gray-800 dark:text-white text-xs mb-1 truncate" title="<?= htmlspecialchars($book['title']) ?>">
                                <?= htmlspecialchars($book['title']) ?>
                            </h4>
                            <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 truncate" title="<?= htmlspecialchars($book['author']) ?>">
                                <?= htmlspecialchars($book['author']) ?>
                            </p>
                            <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded mb-3">
                                <?= htmlspecialchars($book['category_name']) ?>
                            </span>
                            <form method="POST" action="../actions/admin/restore_book.php" class="mt-2">
                                <input type="hidden" name="id" value="<?= $book['id'] ?>">
                                <button type="submit" class="w-full text-center text-xs bg-green-600 hover:bg-green-700 text-white px-1.5 py-1 rounded transition-colors">
                                    <i class="fas fa-undo mr-1"></i>Restore
                                </button>
                            </form>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </main>
</div>

<script src="/book-Library/assets/js/admin/admin-books.js"></script>

<?php include('../includes/footer.php'); ?>