<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Add these lines to check login status
session_start();
$isLoggedIn = isset($_SESSION['user']);

// Add this script tag to pass the login status to JavaScript
?>
<script>
  var userIsLoggedIn = <?php echo $isLoggedIn ? 'true' : 'false'; ?>;
</script>

<?php include('../includes/header.php'); ?>



<?php if (!empty($_SESSION['errors']['auth'])): ?>hi
    hi
    <div id="flash-message" class="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center max-w-xl mx-auto my-6 transition-opacity duration-500 ease-in-out">
        <span><?= $_SESSION['errors']['auth'];
                unset($_SESSION['errors']['auth']); ?></span>
        <button class="absolute top-0 right-0 px-3 py-2 text-red-700 hover:text-red-900" onclick="dismissFlash()">
            &times;
        </button>
    </div>
<?php endif; ?>

<div class="max-w-6xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-4 text-center">Our Bestsellers:</h2>

    <div class="m-8 swiper bestseller-swiper">


        <div id="bestseller-loader" class="flex justify-center items-center my-12">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <div class="swiper-wrapper mb-10" id="bestseller-list"></div>

        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-pagination"></div>
    </div>
</div>
<div class="sticky top-[92px] max-w z-20 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow px-4 py-2 dark:border-gray-700">
    <input
        type="text"
        id="searchInput"
        placeholder="Search title..."
        class="w-full max-w-xl mx-auto mb-6 block p-2 border border-gray-300 rounded-md focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500" />
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

<!-- Book Modal -->
<div class="modal-backdrop" id="bookModal">
    <div class="book-wrapper">
        <button id="closeBtn" class="close-button" onclick="closeBook()">×</button>
        <div class="book" id="book">
            <div class="page left-page">
                <h2 id="bookTitle">Book Title</h2>
                <p id="bookAuthor">Author Name</p>
                <p id="bookDescription">This is the left page of the open book.</p>
            </div>
            <div class="page right-page">
                <h2>Book Details</h2>
                <p id="bookDetails">This is the right page of the open book.</p>
                
                <!-- Rating Section -->
                <div class="rating-section mt-6">
                    <h3 class="text-lg font-semibold mb-3">Rate this book</h3>
                    
                    <!-- Average Rating Display -->
                    <div class="avg-rating mb-4">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-600">Average Rating:</span>
                            <div class="flex items-center gap-1">
                                <span id="avgRatingStars" class="text-yellow-400"></span>
                                <span id="avgRatingValue" class="text-sm font-medium">0.0</span>
                                <span id="totalRatings" class="text-xs text-gray-500">(0 ratings)</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User Rating -->
                    <div class="user-rating mb-4">
                        <p class="text-sm text-gray-600 mb-2">Your Rating:</p>
                        <div class="flex items-center gap-1">
                            <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="1">★</button>
                            <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="2">★</button>
                            <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="3">★</button>
                            <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="4">★</button>
                            <button class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="5">★</button>
                        </div>
                        <p id="ratingMessage" class="text-sm mt-2"></p>
                    </div>
                    
                    <!-- Login Prompt -->
                    <div id="loginPrompt" class="hidden">
                        <p class="text-sm text-gray-600">Please <a href="login.php" class="text-blue-600 hover:underline">log in</a> to rate this book.</p>
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