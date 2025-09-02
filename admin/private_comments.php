<?php
require_once '../includes/auth.php';
require_once '../includes/autoload.php';
requireAdmin();
include('../includes/header.php');

$privateCommentModel = new PrivateComment();
$allComments = $privateCommentModel->getAllComments();
$totalComments = count($allComments);

$userStats = [];
foreach ($allComments as $comment) {
    $userId = $comment['user_id'];
    if (!isset($userStats[$userId])) {
        $userStats[$userId] = [
            'user_name' => $comment['user_name'],
            'email' => $comment['email'],
            'count' => 0,
            'comments' => []
        ];
    }
    $userStats[$userId]['count']++;
    $userStats[$userId]['comments'][] = $comment;
}

uasort($userStats, function($a, $b) {
    return $b['count'] - $a['count'];
});
?>

<div class="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
    <?php include_once '../includes/admin/admin_nav.php'; ?>

    <main class="flex-1 p-3 sm:p-6 min-w-0">
        <div class="max-w-7xl mx-auto">
            <div class="mb-6 sm:mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Personal Notes Management</h1>
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Monitor and analyze user personal notes</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div class="flex items-center">
                        <div class="p-2 sm:p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0">
                            <i class="fas fa-sticky-note text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl"></i>
                        </div>
                        <div class="ml-3 sm:ml-4 min-w-0">
                            <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
                            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"><?= $totalComments ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div class="flex items-center">
                        <div class="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                            <i class="fas fa-users text-blue-600 dark:text-blue-400 text-lg sm:text-xl"></i>
                        </div>
                        <div class="ml-3 sm:ml-4 min-w-0">
                            <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"><?= count($userStats) ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                    <div class="flex items-center">
                        <div class="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0">
                            <i class="fas fa-book text-green-600 dark:text-green-400 text-lg sm:text-xl"></i>
                        </div>
                        <div class="ml-3 sm:ml-4 min-w-0">
                            <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Unique Books</p>
                            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"><?= count(array_unique(array_column($allComments, 'book_id'))) ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">User Personal Notes Breakdown</h2>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Notes Count</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Books with Notes</th>
                                <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <?php if (empty($userStats)): ?>
                                <tr>
                                    <td colspan="4" class="px-4 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div class="flex flex-col items-center">
                                            <i class="fas fa-sticky-note text-3xl sm:text-4xl text-gray-300 mb-3"></i>
                                            <p class="text-base sm:text-lg font-medium">No personal notes yet</p>
                                            <p class="text-xs sm:text-sm">Users haven't added any personal notes to books.</p>
                                        </div>
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($userStats as $userId => $userData): ?>
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700" data-user-id="<?= $userId ?>" data-comments='<?= json_encode($userData['comments']) ?>'>
                                        <td class="px-3 sm:px-6 py-4">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                                    <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                        <i class="fas fa-user text-indigo-600 dark:text-indigo-400 text-sm sm:text-base"></i>
                                                    </div>
                                                </div>
                                                <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        <?= htmlspecialchars($userData['user_name']) ?>
                                                    </div>
                                                    <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        <?= htmlspecialchars($userData['email']) ?>
                                                    </div>
                                                    <!-- Mobile: Show notes count inline -->
                                                    <div class="sm:hidden mt-1">
                                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                            <?= $userData['count'] ?> notes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                <?= $userData['count'] ?> notes
                                            </span>
                                        </td>
                                        <td class="px-3 sm:px-6 py-4 hidden md:table-cell">
                                            <div class="text-sm text-gray-900 dark:text-white">
                                                <?php foreach (array_slice($userData['comments'], 0, 2) as $comment): ?>
                                                    <div class="mb-1">
                                                        <div class="font-medium truncate" title="<?= htmlspecialchars($comment['book_title']) ?>">
                                                            <?= htmlspecialchars($comment['book_title']) ?>
                                                        </div>
                                                        <div class="text-gray-500 dark:text-gray-400 text-xs truncate">
                                                            by <?= htmlspecialchars($comment['book_author']) ?>
                                                        </div>
                                                    </div>
                                                <?php endforeach; ?>
                                                <?php if (count($userData['comments']) > 2): ?>
                                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                                        +<?= count($userData['comments']) - 2 ?> more books
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </td>
                                        <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="viewUserComments(<?= $userId ?>, '<?= htmlspecialchars($userData['user_name']) ?>')" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs sm:text-sm">
                                                <span class="hidden sm:inline">View Details</span>
                                                <span class="sm:hidden">View</span>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<div id="userCommentsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white">User Personal Notes</h3>
                <button onclick="closeUserCommentsModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                    <i class="fas fa-times text-lg sm:text-xl"></i>
                </button>
            </div>
            
            <div id="userCommentsContent" class="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-120px)]">
            </div>
        </div>
    </div>
</div>

<script src="/book-Library/assets/js/admin/admin-private-comments.js"></script>

<?php include('../includes/footer.php'); ?>
