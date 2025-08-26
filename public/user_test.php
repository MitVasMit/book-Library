<?php
require_once '../includes/user_helpers.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Authentication Test</title>
    <link href="../assets/css/output.css" rel="stylesheet" />
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">User Authentication & Role Testing</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Authentication Status -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Authentication Status</h2>
                
                <?php if (isLoggedIn()): ?>
                    <div class="space-y-3">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span class="text-green-700 font-medium">Logged In</span>
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded">
                            <p><strong>Name:</strong> <?= htmlspecialchars(getCurrentUserName()) ?></p>
                            <p><strong>Email:</strong> <?= htmlspecialchars(getCurrentUserEmail()) ?></p>
                            <p><strong>User ID:</strong> <?= getCurrentUserId() ?></p>
                            <p><strong>Role:</strong> 
                                <span class="inline-block px-2 py-1 text-xs rounded-full 
                                    <?= isAdmin() ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800' ?>">
                                    <?= getUserRole() ?>
                                </span>
                            </p>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span class="text-red-700 font-medium">Not Logged In</span>
                    </div>
                    <p class="text-gray-600 mt-2">Please <a href="login.php" class="text-blue-600 hover:underline">login</a> to see your information.</p>
                <?php endif; ?>
            </div>

            <!-- Role-Based Features -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Available Features</h2>
                
                <div class="space-y-3">
                    <!-- Admin Features -->
                    <?php if (isAdmin()): ?>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="text-blue-700">Admin Dashboard</span>
                            <a href="../admin/dashboard.php" class="ml-auto text-blue-600 hover:underline text-sm">Access →</a>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="text-blue-700">Manage Books</span>
                            <a href="../admin/books.php" class="ml-auto text-blue-600 hover:underline text-sm">Access →</a>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="text-blue-700">Review Management</span>
                            <a href="../admin/reviews.php" class="ml-auto text-blue-600 hover:underline text-sm">Access →</a>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <span class="text-gray-500 line-through">Favorites (Hidden for Admins)</span>
                        </div>
                    <?php endif; ?>

                    <!-- Regular User Features -->
                    <?php if (isRegularUser()): ?>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span class="text-green-700">Favorites</span>
                            <span class="ml-auto text-green-600 text-sm">Available</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span class="text-green-700">Book Reviews</span>
                            <span class="ml-auto text-green-600 text-sm">Available</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span class="text-green-700">Book Ratings</span>
                            <span class="ml-auto text-green-600 text-sm">Available</span>
                        </div>
                    <?php endif; ?>

                    <!-- Guest Features -->
                    <?php if (!isLoggedIn()): ?>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span class="text-yellow-700">Browse Books</span>
                            <span class="ml-auto text-yellow-600 text-sm">Available</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span class="text-yellow-700">Search Library</span>
                            <span class="ml-auto text-yellow-600 text-sm">Available</span>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Function Examples -->
            <div class="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Function Examples</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded">
                        <h3 class="font-medium text-gray-800 mb-2">Basic Checks</h3>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li><code>isLoggedIn()</code>: <?= isLoggedIn() ? 'true' : 'false' ?></li>
                            <li><code>isAdmin()</code>: <?= isAdmin() ? 'true' : 'false' ?></li>
                            <li><code>isRegularUser()</code>: <?= isRegularUser() ? 'true' : 'false' ?></li>
                            <li><code>getUserRole()</code>: <?= getUserRole() ?? 'null' ?></li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded">
                        <h3 class="font-medium text-gray-800 mb-2">Advanced Checks</h3>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li><code>hasRole('admin')</code>: <?= hasRole('admin') ? 'true' : 'false' ?></li>
                            <li><code>hasRole('user')</code>: <?= hasRole('user') ? 'true' : 'false' ?></li>
                            <li><code>hasAnyRole(['admin', 'user'])</code>: <?= hasAnyRole(['admin', 'user']) ? 'true' : 'false' ?></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation -->
        <div class="mt-8 text-center">
            <a href="index.php" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Back to Home
            </a>
            <?php if (isLoggedIn()): ?>
                <a href="../actions/logout.php" class="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-4">
                    Logout
                </a>
            <?php else: ?>
                <a href="login.php" class="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-4">
                    Login
                </a>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
