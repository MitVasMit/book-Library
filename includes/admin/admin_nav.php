<?php
$sidebarExpanded = true;
if (isset($_COOKIE['sidebarExpanded'])) {
    $sidebarExpanded = $_COOKIE['sidebarExpanded'] === 'true';
}
?>
<aside
  id="adminSidebar"
  class="min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white flex flex-col py-6 px-4 mt-5 transition-all duration-300 ease-in-out relative<?php echo !$sidebarExpanded ? ' collapsed' : ''; ?>"
  style="width: 16rem;">

  <button
    id="toggleSidebar"
    class="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 text-gray-500 dark:text-gray-300 hover:text-blue-500 focus:outline-none text-2xl leading-none transition-transform duration-300 z-20"
    title="Toggle sidebar">
    &#8592;
  </button>

  <div class="flex items-center mb-5">
    <h2 id="sidebarTitle" class="text-xl font-bold flex items-center gap-2">
      <i class="fas fa-gauge"></i>
      <a href="dashboard.php" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</a>
    </h2>
  </div>

  <div class="flex flex-col gap-4 mt-5">
    <nav class="flex flex-col space-y-2">
      <a href="books.php" class="flex items-center space-x-3 px-3 py-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <i class="fas fa-book"></i>
        <span class="sidebar-text transition-opacity duration-300">Manage Books</span>
      </a>
      <a href="categories.php" class="flex items-center space-x-3 px-3 py-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <i class="fas fa-layer-group"></i>
        <span class="sidebar-text transition-opacity duration-300">Book Categories</span>
      </a>
      <a href="private_comments.php" class="flex items-center space-x-3 px-3 py-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <i class="fas fa-sticky-note"></i>
        <span class="sidebar-text transition-opacity duration-300">Personal Notes</span>
      </a>
      <a href="reviews.php" class="flex items-center space-x-3 px-3 py-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <i class="fas fa-star"></i>
        <span class="sidebar-text transition-opacity duration-300">Reviews</span>
      </a>
      <a href="favorites.php" class="flex items-center space-x-3 px-3 py-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <i class="fas fa-heart"></i>
        <span class="sidebar-text transition-opacity duration-300">User Favorites</span>
      </a>
    </nav>
  </div>
</aside>