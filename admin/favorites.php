<?php
require_once '../includes/auth.php';
require_once '../includes/autoload.php';
requireAdmin();
include('../includes/header.php');
?>
<link rel="stylesheet" href="../assets/css/favorites.css" />

<?php
$favorites = $favoriteModel->getAllUserFavorites();
$totalFavorites = count($favorites);

$userStats = [];
foreach ($favorites as $favorite) {
    $userId = $favorite['user_id'];
    if (!isset($userStats[$userId])) {
        $userStats[$userId] = [
            'user_name' => $favorite['user_name'],
            'email' => $favorite['email'],
            'count' => 0,
            'favorites' => []
        ];
    }
    $userStats[$userId]['count']++;
    $userStats[$userId]['favorites'][] = $favorite;
}

uasort($userStats, function($a, $b) {
    return $b['count'] - $a['count'];
});
?>

<div class="flex min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
    <?php include_once '../includes/admin/admin_nav.php'; ?>

    <main class="flex-1 p-6">
            <div class="max-w-7xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Favorites Management</h1>
                    <p class="text-gray-600 dark:text-gray-400">Monitor and analyze user book preferences</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-red-100 dark:bg-red-900">
                                <i class="fas fa-heart text-red-600 dark:text-red-400 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Favorites</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-white"><?= $totalFavorites ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                <i class="fas fa-users text-blue-600 dark:text-blue-400 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-white"><?= count($userStats) ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                <i class="fas fa-book text-green-600 dark:text-green-400 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Books</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-white"><?= count(array_unique(array_column($favorites, 'book_id'))) ?></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-medium text-gray-900 dark:text-white">User Favorites Breakdown</h2>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Favorites Count</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Favorite Books</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <?php if (empty($userStats)): ?>
                                    <tr>
                                        <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <i class="fas fa-heart-broken text-4xl mb-4 block"></i>
                                            <p class="text-lg">No favorites found</p>
                                            <p class="text-sm">Users haven't added any books to favorites yet.</p>
                                        </td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($userStats as $userId => $userData): ?>
                                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <div class="flex-shrink-0 h-10 w-10">
                                                        <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                            <i class="fas fa-user text-blue-600 dark:text-blue-400"></i>
                                                        </div>
                                                    </div>
                                                    <div class="ml-4">
                                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                                            <?= htmlspecialchars($userData['user_name']) ?>
                                                        </div>
                                                        <div class="text-sm text-gray-500 dark:text-gray-400">
                                                            <?= htmlspecialchars($userData['email']) ?>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    <?= $userData['count'] ?> <?= $userData['count'] === 1 ? 'book' : 'books' ?>
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex flex-wrap gap-2">
                                                    <?php foreach (array_slice($userData['favorites'], 0, 3) as $favorite): ?>
                                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                            <?= htmlspecialchars($favorite['title']) ?>
                                                        </span>
                                                    <?php endforeach; ?>
                                                    <?php if (count($userData['favorites']) > 3): ?>
                                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                            +<?= count($userData['favorites']) - 3 ?> more
                                                        </span>
                                                    <?php endif; ?>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onclick="viewUserFavorites(<?= $userId ?>)" 
                                                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                    View Details
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

    <div id="userFavoritesModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white" id="modalTitle">User Favorites</h2>
                <button onclick="closeUserFavoritesModal()" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
            </div>
            
            <div id="userFavoritesContent">
            </div>
        </div>
    </div>

    <script>
        function viewUserFavorites(userId) {

            const modal = document.getElementById('userFavoritesModal');
            const content = document.getElementById('userFavoritesContent');
            const title = document.getElementById('modalTitle');
            
            if (!modal) {
                return;
            }
            
            const userData = <?= json_encode($userStats) ?>[userId];
            if (!userData) {
                return;
            }
            
            title.textContent = `${userData.user_name}'s Favorites (${userData.count})`;
            
            content.innerHTML = `
                <div class="mb-4">
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 class="font-medium text-gray-900 dark:text-white mb-2">User Information</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Name:</strong> ${userData.user_name}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Email:</strong> ${userData.email}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><strong>Total Favorites:</strong> ${userData.count}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${userData.favorites.map(favorite => `
                        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                            <img src="../uploads/${favorite.cover_image || 'logo.png'}" alt="${favorite.title}" class="w-full h-48 object-cover">
                            <div class="p-4">
                                <h4 class="font-semibold text-gray-800 dark:text-white text-lg mb-2">${favorite.title}</h4>
                                <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">by ${favorite.author}</p>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                        ${favorite.category_name}
                                    </span>
                                    <div class="flex items-center gap-1">
                                        <i class="fas fa-star text-yellow-400"></i>
                                        <span class="text-sm text-gray-600 dark:text-gray-300">${favorite.rating || 'N/A'}</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Added: ${new Date(favorite.created_at).toLocaleDateString()}
                </p>
            </div>
        </div>
    `).join('')}
            </div>
        `;
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
            modal.style.pointerEvents = 'auto';
            modal.classList.add('show');
        }

        function closeUserFavoritesModal() {
            const modal = document.getElementById('userFavoritesModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }
        }

        document.getElementById('userFavoritesModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeUserFavoritesModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeUserFavoritesModal();
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('userFavoritesModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('show');
                
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.style.pointerEvents = 'none';
            }
        });

        (function() {
            const modal = document.getElementById('userFavoritesModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('show');
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.style.pointerEvents = 'none';
            }
        })();
    </script>

<?php include('../includes/footer.php'); ?>
