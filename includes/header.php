<?php
require_once __DIR__ . '/user_helpers.php';
$user = $_SESSION['user'] ?? null;

// Get the correct base path for assets
$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath === '/book-Library/public') {
    $assetPath = '../assets';
} else {
    $assetPath = '/book-Library/assets';
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>Book Library</title>

    <!-- Dark Mode CSS - Loaded first to prevent flash -->
    <link rel="stylesheet" href="/book-Library/assets/css/dark-mode.css" />

    <!-- Main CSS -->
    <link href="/book-Library/assets/css/output.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <!-- swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-papm6Q+..." crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Admin Navigation CSS -->
    <link rel="stylesheet" href="/book-Library/assets/css/admin-nav.css" />
    <!-- Book Modal CSS -->
    <link rel="stylesheet" href="/book-Library/assets/css/book-modal.css" />
    <!-- Carousel CSS -->
    <link rel="stylesheet" href="/book-Library/assets/css/carousel.css" />
    <!-- Filters CSS -->
    <link rel="stylesheet" href="/book-Library/assets/css/filters.css" />
    <!-- Mobile Menu CSS - Available for all users -->
    <link rel="stylesheet" href="/book-Library/assets/css/mobile-menu.css" />
    <!-- Favorites CSS - Only for non-admin users -->
    <?php if (isRegularUser()): ?>
        <link rel="stylesheet" href="/book-Library/assets/css/favorites.css" />
    <?php endif; ?>

    <!-- Dark Mode JavaScript - Loaded early to prevent flash -->
    <script src="/book-Library/assets/js/dark-mode.js"></script>

    <!-- Other JavaScript -->
    <script src="/book-Library/assets/js/filters.js" defer></script>
    <script src="/book-Library/assets/js/main.js" defer></script>
    <!-- Mobile Menu JavaScript - Loaded for all users -->
    <script src="/book-Library/assets/js/mobile-menu.js" defer></script>
    <?php if (isRegularUser()): ?>
        <script src="/book-Library/assets/js/favorites.js" defer></script>
    <?php endif; ?>

    <!-- User Authentication Status -->
    <script>
        window.userIsLoggedIn = <?= $user ? 'true' : 'false' ?>;
        window.currentUser = <?= $user ? json_encode($user) : 'null' ?>;
        window.userRole = <?= $user ? json_encode($user['role']) : 'null' ?>;
    </script>

</head>

<body class="bg-blue-100 text-gray-900 dark:bg-gray-900 dark:text-white">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow">
        <div class="w-full px-8 py-4 flex items-center">
            <!-- Left Section: Logo and Welcome Message -->
            <div class="flex items-center gap-4 flex-shrink-0 ml-2 relative z-10 min-w-0">
                <a href="/book-Library/public/index.php" class="block" style="display: block !important;">
                    <img src="<?= $assetPath ?>/images/logo.png" alt="logo" style="display: block !important; width: 40px !important; height: 40px !important; object-fit: contain !important;">
                </a>

                <?php if ($user): ?>
                    <div class="flex items-center gap-2 hidden sm:flex">
                        <span class="text-sm text-gray-600 dark:text-gray-300">
                            Welcome, <strong class="text-blue-600 dark:text-blue-400"><?= htmlspecialchars($user['name']) ?></strong>
                        </span>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Center Section: open Library Branding -->
            <div class="flex-1 flex justify-center">
                <a href="/book-Library/public/index.php" class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">open</span>
                    <span class="text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg transition-transform duration-300 hover:scale-105">Library</span>
                </a>
            </div>

            <!-- Right Section: Navigation -->
            <nav class="flex-shrink-0 mr-2">
                <?php if (!$user): ?>
                    <div class="flex items-center space-x-4">
                        <a href="/book-Library/public/login.php" class="text-gray-600 hover:text-blue-600 inline-flex items-center font-medium">Login</a>
                        <a href="/book-Library/public/register.php" class="text-gray-600 hover:text-blue-600 inline-flex items-center font-medium">Register</a>

                        <!-- Standalone Dark Mode Toggle for guest users -->
                        <button id="darkToggleStandalone" class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors ml-4" title="Toggle Dark Mode">
                            🌙
                        </button>
                    </div>
                <?php else: ?>
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center space-x-4">
                        <?php if (isRegularUser()): ?>
                            <button id="favoritesBtn" class="text-gray-600 hover:text-red-600 inline-flex items-center gap-1 font-medium transition-colors group relative">
                                <i class="fas fa-heart transition-colors" id="favoritesIcon"></i>
                                <span>Favorites</span>
                                <span id="favoriteCount" class="bg-red-500 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">0</span>
                            </button>
                        <?php endif; ?>

                        <?php if (isAdmin()): ?>
                            <a href="/book-Library/admin/dashboard.php" class="text-blue-600 font-semibold">Admin Panel</a>
                        <?php endif; ?>

                        <a href="/book-Library/actions/logout.php" class="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                            </svg>
                            Logout
                        </a>

                        <button id="darkToggleDesktop" class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors" title="Toggle Dark Mode">
                            🌙
                        </button>
                    </div>

                    <!-- Tablet Navigation (Icons Only) -->
                    <div class="hidden sm:flex md:hidden items-center space-x-3">
                        <?php if (isRegularUser()): ?>
                            <button id="favoritesBtnTablet" class="text-red-500 hover:text-red-600 w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative flex items-center justify-center" title="Favorites">
                                <i class="fas fa-heart transition-colors text-lg" id="favoritesIconTablet"></i>
                                <span id="favoriteCountTablet" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">0</span>
                            </button>
                        <?php endif; ?>

                        <?php if (isAdmin()): ?>
                            <a href="/book-Library/admin/dashboard.php" class="text-blue-600 w-10 h-10 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center" title="Admin Panel">
                                <i class="fas fa-cog text-lg"></i>
                            </a>
                        <?php endif; ?>

                        <a href="/book-Library/actions/logout.php" class="text-gray-600 hover:text-blue-600 w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center" title="Logout">
                            <i class="fas fa-sign-out-alt text-lg"></i>
                        </a>

                        <button id="darkToggleTablet" class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center" title="Toggle Dark Mode">
                            🌙
                        </button>
                    </div>

                    <!-- Mobile Navigation (Hamburger Menu) -->
                    <div class="sm:hidden flex items-center gap-2">
                        <button id="darkToggle" class="text-gray-600 dark:text-gray-300 hover:text-yellow-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle Dark Mode">
                            🌙
                        </button>
                        <button id="mobileMenuBtn" class="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Menu">
                            <i class="fas fa-bars text-lg"></i>
                        </button>
                    </div>
                <?php endif; ?>
            </nav>
        </div>
    </header>

    <!-- Favorites Modal - Only for non-admin users -->
    <?php if (isRegularUser()): ?>
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
                        <a href="/book-Library/public/index.php" class="inline-block px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                            Start Exploring
                        </a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Mobile Menu Overlay -->
    <div id="mobileMenu" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="absolute top-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-2xl transform translate-x-full transition-all duration-300 ease-in-out rounded-lg" id="mobileMenuContent">
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Menu</h3>
                    <button id="closeMobileMenu" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <nav class="space-y-3">
                    <?php if (isRegularUser()): ?>
                        <button id="favoritesBtnMobile" class="w-full text-left p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-heart text-red-500 text-lg" id="favoritesIconMobile"></i>
                                <span class="text-gray-800 dark:text-white font-medium">Favorites</span>
                                <span id="favoriteCountMobile" class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">0</span>
                            </div>
                        </button>
                    <?php endif; ?>

                    <?php if (isAdmin()): ?>
                        <a href="/book-Library/admin/dashboard.php" class="block p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-cog text-blue-600 text-lg"></i>
                                <span class="text-gray-800 dark:text-white font-medium">Admin Panel</span>
                            </div>
                        </a>
                    <?php endif; ?>

                    <a href="/book-Library/actions/logout.php" class="block p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-sign-out-alt text-gray-600 text-lg"></i>
                            <span class="text-gray-800 dark:text-white font-medium">Logout</span>
                        </div>
                    </a>
                </nav>
            </div>
        </div>
    </div>