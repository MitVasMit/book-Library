<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$user = $_SESSION['user'] ?? null;
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Library</title>
    <link href="../assets/css/output.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <!-- swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-papm6Q+..." crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Admin Navigation CSS -->
    <link rel="stylesheet" href="../assets/css/admin-nav.css" />
    <!-- Book Modal CSS -->
    <link rel="stylesheet" href="../assets/css/book-modal.css" />
    <!-- Carousel CSS -->
    <link rel="stylesheet" href="../assets/css/carousel.css" />
    <!-- Filters CSS -->
    <link rel="stylesheet" href="../assets/css/filters.css" />
    <!-- Favorites CSS -->
    <link rel="stylesheet" href="../assets/css/favorites.css" />
    <!-- Filters JavaScript -->
    <script src="../assets/js/filters.js" defer></script>
    <!-- Main JavaScript -->
    <script src="../assets/js/main.js" defer></script>
    <!-- Favorites JavaScript -->
    <script src="../assets/js/favorites.js" defer></script>
    
    <!-- User Authentication Status -->
    <script>
        window.userIsLoggedIn = <?= $user ? 'true' : 'false' ?>;
        window.currentUser = <?= $user ? json_encode($user) : 'null' ?>;
    </script>

</head>

<body class="bg-blue-100 text-gray-900 dark:bg-gray-900 dark:text-white">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">

            <div class="flex items-center gap-2 w-1/3">
                <a href="../public/index.php"><img class="w-[40px]" src="../assets/images/logo.png" alt="logo"></a>
            </div>

            <div class="text-center w-1/3">
                <a href="../public/index.php" class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">open</span>
                    <span class="text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg transition-transform duration-300 hover:scale-105">Library</span>
                </a>
            </div>

            <nav class="w-1/3 text-right space-x-4">
                <?php if (!$user): ?>
                    <a href="../public/login.php" class="text-gray-600 hover:text-blue-600 inline-flex items-center font-medium">Login</a>
                    <a href="../public/register.php" class="text-gray-600 hover:text-blue-600 inline-flex items-center font-medium">Register</a>
                <?php else: ?>
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                        Welcome, <strong><?= htmlspecialchars($user['name']) ?></strong>
                    </span>

                    <button id="favoritesBtn" class="text-gray-600 hover:text-red-600 inline-flex items-center gap-1 font-medium transition-colors">
                        <i class="fas fa-heart"></i>
                        <span>Favorites</span>
                        <span id="favoriteCount" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">0</span>
                    </button>

                    <?php if ($user['role'] === 'admin'): ?>
                        <a href="../admin/dashboard.php" class="text-blue-600 font-semibold">Admin Panel</a>
                    <?php endif; ?>

                    <a href="../actions/logout.php" class="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                        </svg>
                        Logout
                    </a>
                <?php endif; ?>

                <button id="darkToggle" class="ml-2 text-gray-600 dark:text-gray-300 hover:text-yellow-500" title="Toggle Dark Mode">
                    🌙
                </button>
            </nav>

        </div>
    </header>

    <!-- Favorites Modal -->
    <div id="favoritesModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 pb-6 px-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-6rem)] overflow-hidden">
            <!-- Header -->
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <i class="fas fa-heart text-red-500 text-sm"></i>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-800 dark:text-white">My Favorites</h2>
                        <p class="text-xs text-gray-600 dark:text-gray-400">Your personal book collection</p>
                    </div>
                </div>
                <button id="closeFavoritesModal" class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
            
            <!-- Content -->
            <div id="favoritesContent" class="p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <!-- Loader -->
                <div id="favoritesLoader" class="flex flex-col items-center justify-center py-16">
                    <div class="animate-spin rounded-full h-10 w-10 border-4 border-red-200 border-t-red-500 mb-3"></div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Loading your favorites...</p>
                </div>
                
                <!-- Favorites List -->
                <div id="favoritesList" class="hidden">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-base font-semibold text-gray-800 dark:text-white">Favorite Books</h3>
                        <span id="favoritesCount" class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"></span>
                    </div>
                    <div id="favoritesGrid" class="space-y-3"></div>
                </div>
                
                <!-- No Favorites -->
                <div id="noFavorites" class="hidden text-center py-16">
                    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-heart-broken text-2xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">No favorites yet</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">You haven't added any books to your favorites collection.</p>
                    <a href="../public/index.php" class="inline-block px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                        Start Exploring
                    </a>
                </div>
            </div>
        </div>
    </div>