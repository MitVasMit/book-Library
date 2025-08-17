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
    <!-- Filters JavaScript -->
    <script src="../assets/js/filters.js" defer></script>
    <!-- Main JavaScript -->
    <script src="../assets/js/main.js" defer></script>
    
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