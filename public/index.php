<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

require_once __DIR__ . '/../includes/autoload.php';
SecureSession::start();
$isLoggedIn = isset($_SESSION['user']);

?>

<?php include('../includes/header.php'); ?>

<?php if (!empty($_SESSION['errors']['auth'])): ?>

    <div id="flash-message" class="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center max-w-xl mx-auto my-6 transition-opacity duration-500 ease-in-out">
        <span><?= $_SESSION['errors']['auth'];
                unset($_SESSION['errors']['auth']); ?></span>
        <button class="absolute top-0 right-0 px-3 py-2 text-red-700 hover:text-red-900" onclick="dismissFlash()">
            &times;
        </button>
    </div>
<?php endif; ?>

<div class="max-w-6xl mx-auto mt-8">
    <h2 class="text-2xl font-bold mb-4 text-center">Our Bestsellers:</h2>

    <div class="relative">
        <div id="bestseller-loader" class="flex justify-center items-center my-12">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <div class="swiper bestseller-swiper">
            <div class="swiper-wrapper" id="bestseller-list"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>
    </div>
</div>
<div class="sticky top-[92px] max-w z-20 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow px-4 py-2 mt-5 dark:border-gray-700">
    <div class="flex items-center gap-3 max-w-xl mx-auto">
        <input
            type="text"
            id="searchInput"
            placeholder="Search title..."
            class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500" />
        <button
            id="filterBtn"
            class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
            title="Filter Books">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
            </svg>
            <span class="hidden sm:inline">Filters</span>
        </button>
    </div>

    <div id="searchActiveFilters" class="max-w-xl mx-auto mt-3 hidden">
        <div class="flex flex-wrap gap-2" id="searchActiveFiltersList">
        </div>
    </div>
</div>

<div id="filterModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Filter Books</h2>
            <button id="closeFilterModal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
        </div>

        <form id="filterForm" class="space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3" id="categoryFilters">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Publication Date</label>
                <div class="flex items-center gap-4">
                    <label class="flex items-center">
                        <input type="checkbox" id="newBooks" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">New Books (Last Month)</span>
                    </label>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rating</label>
                <div class="space-y-3">
                    <div class="flex items-center gap-4">
                        <label class="flex items-center">
                            <input type="radio" name="ratingFilter" value="all" checked class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-sm text-gray-700 dark:text-gray-300">All Ratings</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="ratingFilter" value="high" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-sm text-gray-700 dark:text-gray-300">4+ Stars</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="ratingFilter" value="low" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-sm text-gray-700 dark:text-gray-300">Below 3 Stars</span>
                        </label>
                    </div>
                    <div class="flex items-center gap-4">
                        <label class="text-sm text-gray-700 dark:text-gray-300">Min Rating:</label>
                        <input type="range" id="minRating" min="0" max="5" step="0.5" value="0" class="flex-1">
                        <span id="minRatingValue" class="text-sm font-medium text-gray-700 dark:text-gray-300">0</span>
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</label>
                <div class="flex items-center gap-4">
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="title" checked class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Title</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="author" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Author</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="rating" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Rating</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="date" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Date Added</span>
                    </label>
                </div>
                <div class="flex items-center gap-4 mt-3">
                    <label class="flex items-center">
                        <input type="radio" name="sortOrder" value="asc" checked class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">A-Z / Low to High</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="sortOrder" value="desc" class="mr-2 border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Z-A / High to Low</span>
                    </label>
                </div>
            </div>

            <div id="activeFilters" class="hidden">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Active Filters:</label>
                <div id="activeFiltersList" class="flex flex-wrap gap-2">
                </div>
                <button type="button" id="clearAllFilters" class="text-sm text-red-600 hover:text-red-800 mt-2">
                    Clear All Filters
                </button>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button type="button" id="cancelFilter" class="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>
</div>
<section class="py-20 bg-gray-100 dark:bg-gray-800">
    <div class="container mx-auto px-4">
        <div class="flex flex-col min-h-[600px]">
            <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Our Books:</h2>
            <div id="book-list-loader" class="flex justify-center items-center my-12 hidden">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>

            <div id="book-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 flex-1"></div>
            <div id="pagination" class="flex justify-center items-center mt-10 mb-6"></div>
        </div>
    </div>
</section>

<div class="modal-backdrop" id="bookModal">
    <div class="book-wrapper">
        <button id="closeBtn" class="close-button" onclick="closeBook()">×</button>

        <div class="book" id="book">
            <div class="page left-page">
                <div class="left-page-content">
                    <h1 id="bookTitle" class="book-title">Book Title</h1>
                    <div class="book-meta">
                        <p id="bookAuthor" class="book-author">Author Name</p>
                        <p id="bookCategory" class="book-category">Category</p>
                        <p id="bookFavoriteCount" class="book-favorite-count">This book is a favorite to 0 users</p>
                    </div>
                    <div class="book-description">
                        <h3>About this book</h3>
                        <p id="bookDescription">This is the left page of the open book.</p>
                    </div>
                    <div class="book-details">
                        <p id="bookDetails">Additional details about the book.</p>
                        <p id="bookPages" class="book-pages"></p>
                        <p id="bookYear" class="book-year"></p>
                    </div>

                    <!-- Private Comments Section -->
                    <div class="private-comments-section mt-6">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Personal Notes</h3>
                        
                        <!-- For logged in users -->
                        <div id="privateCommentForm" class="space-y-3" style="display: none;">
                            <textarea
                                id="privateCommentText"
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                placeholder="Add your personal notes about this book... (max 1000 characters)"></textarea>
                            
                            <div class="flex justify-between items-center">
                                <span id="charCount" class="text-xs text-gray-500 dark:text-gray-400">0/1000</span>
                                <button
                                    id="submitPrivateCommentBtn"
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm">
                                    Save Note
                                </button>
                            </div>
                            
                            <div id="privateCommentMessage" class="text-sm mt-2"></div>
                            <div id="favoriteAutoAddMessage" class="text-xs text-green-600 dark:text-green-400 mt-1 hidden">
                                <i class="fas fa-heart text-red-500 mr-1"></i>
                                This book will be automatically added to your favorites
                            </div>
                        </div>

                        <!-- For non-logged in users -->
                        <div id="privateCommentLoginPrompt" class="text-center py-4">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Please <a href="login.php" class="text-blue-600 hover:underline">log in</a> to add your personal notes.</p>
                        </div>

                        <!-- Display existing comment -->
                        <div id="existingComment" class="hidden mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div class="flex justify-between items-start">
                                <p id="commentText" class="text-sm text-gray-700 dark:text-gray-300"></p>
                                <button id="editCommentBtn" class="text-blue-600 hover:text-blue-700 text-xs ml-2">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                            <p id="commentDate" class="text-xs text-gray-500 dark:text-gray-400 mt-2"></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="page right-page">
                <div class="right-page-content">
                    <h2 class="section-title">Book Information</h2>

                    <!-- Favorite Button with Average Rating -->
                    <div id="favoriteSection" class="favorite-section">
                        <!-- Official Average Rating - Left of Favorite Button -->
                        <div class="official-rating">
                            <span class="rating-text">Average:</span>
                            <div class="rating-value">
                                <span id="avgRatingStars" class="text-yellow-400 text-sm"></span>
                                <span id="avgRatingValue" class="text-sm font-medium text-gray-700">0.0</span>
                            </div>
                            <span id="totalRatings" class="total-ratings">(0)</span>
                        </div>

                        <button id="favoriteBtn" class="favorite-btn-modal" style="display: none;">
                            <i class="far fa-heart"></i>
                            <span class="favorite-text">Add to Favorites</span>
                        </button>
                        <div id="favoriteLoginPrompt" class="hidden">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Please <a href="login.php" class="text-blue-600 hover:underline">log in</a> to add books to favorites.</p>
                        </div>
                    </div>

                    <!-- User Actions Frame - Combined Rating and Review -->
                    <div class="user-actions-frame">
                        <div class="rating-section">
                            <h3 id="ratingLabel" class="action-title">Rate this book</h3>
                            <div class="user-rating">
                                <div class="flex items-center gap-1">
                                    <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="1">★</button>
                                    <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="2">★</button>
                                    <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="3">★</button>
                                    <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="4">★</button>
                                    <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="5">★</button>
                                </div>
                                <p id="ratingMessage" class="text-sm mt-2"></p>
                            </div>
                            <div id="loginPrompt" class="hidden">
                                <p class="text-sm text-gray-600">Please <a href="login.php" class="text-blue-600 hover:underline">log in</a> to rate this book.</p>
                            </div>
                        </div>

                        <!-- Review Section - Only for Database Books -->
                        <div id="reviewSection" class="review-section hidden">
                            <h3 class="action-title">Write a review</h3>

                            <div id="reviewForm" class="space-y-4">
                                <div>
                                    <textarea
                                        id="reviewComment"
                                        rows="3"
                                        class="review-textarea"
                                        placeholder="Share your thoughts about this book..."></textarea>
                                </div>

                                <div class="flex justify-end">
                                    <button
                                        id="submitReviewBtn"
                                        class="submit-review-btn">
                                        Submit Review
                                    </button>
                                </div>

                                <div id="reviewMessage" class="text-sm mt-2"></div>
                            </div>

                            <div id="reviewLoginPrompt" class="hidden">
                                <p class="text-sm text-gray-600">Please <a href="login.php" class="text-blue-600 hover:underline">log in</a> to write a review.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Reviews Display Section -->
                    <div id="reviewsSection" class="reviews-section hidden">
                        <h3 class="section-title">Reader Reviews</h3>
                        <div id="reviewsList" class="space-y-3">
                            <!-- Reviews will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <div class="cover">
                <h2 id="coverTitle">Cover</h2>
                <p id="coverAuthor">Author</p>
            </div>
        </div>
    </div>
</div>

<button id="scrollToTopBtn"
    class="fixed bottom-8 right-8 p-3 bg-blue-700 text-white rounded-full shadow-lg opacity-0 pointer-events-none transition-opacity duration-300 hover:bg-blue-800 z-50"
    aria-label="Scroll to top">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
    </svg>
</button>

<?php include('../includes/footer.php'); ?>