class FavoritesManager {
    constructor() {
        this.favoriteCount = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFavoriteCount();
        
        // Initialize favorite states immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeFavoriteStates();
            });
        } else {
            // Page is already loaded
            this.initializeFavoriteStates();
        }
    }

    bindEvents() {
        // Favorites button click
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            favoritesBtn.addEventListener('click', () => this.openFavoritesModal());
        }

        // Close modal button
        const closeBtn = document.getElementById('closeFavoritesModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFavoritesModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeFavoritesModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeFavoritesModal();
            }
        });
    }

    openFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadFavorites();
        }
    }

    closeFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async loadFavorites() {
        const loader = document.getElementById('favoritesLoader');
        const list = document.getElementById('favoritesList');
        const noFavorites = document.getElementById('noFavorites');

        if (loader) loader.classList.remove('hidden');
        if (list) list.classList.add('hidden');
        if (noFavorites) noFavorites.classList.add('hidden');

        try {
            const response = await fetch('../actions/get_user_favorites.php');
            const data = await response.json();

            if (data.success) {
                this.displayFavorites(data.favorites);
                this.updateFavoriteCount(data.favorite_count);
            } else {
                console.error('Failed to load favorites:', data.message);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    }

    displayFavorites(favorites) {
        const list = document.getElementById('favoritesList');
        const noFavorites = document.getElementById('noFavorites');
        const favoritesCount = document.getElementById('favoritesCount');
        const favoritesGrid = document.getElementById('favoritesGrid');

        if (!list || !noFavorites || !favoritesCount || !favoritesGrid) return;

        if (favorites.length === 0) {
            list.classList.add('hidden');
            noFavorites.classList.remove('hidden');
            return;
        }

        list.classList.remove('hidden');
        noFavorites.classList.add('hidden');

        // Update count
        favoritesCount.textContent = `${favorites.length} book${favorites.length !== 1 ? 's' : ''}`;

        // Create compact list layout
        favoritesGrid.innerHTML = favorites.map(favorite => this.createFavoriteCard(favorite)).join('');

        // Add event listeners to remove buttons (now handled by onclick in HTML)
        // The buttons are now self-contained with their own event handlers
    }

    createFavoriteCard(favorite) {
        const coverImage = favorite.cover_image ? `../uploads/${favorite.cover_image}` : '../assets/images/logo.png';
        
        // Create a book object that matches the structure expected by openBookModal
        const bookObject = {
            id: favorite.id,
            title: favorite.title,
            author: favorite.author,
            cover_image: favorite.cover_image,
            rating: favorite.rating,
            category_name: favorite.category_name,
            source: 'database'
        };
        
        // Convert the book object to a JSON string for the onclick attribute
        const bookObjectJson = JSON.stringify(bookObject).replace(/"/g, '&quot;');
        
        return `
            <div class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer" 
                 onclick="window.openBookModal(${bookObjectJson})">
                <div class="p-3">
                    <div class="flex items-center gap-3 mb-3">
                        <!-- Cover Image -->
                        <div class="flex-shrink-0">
                            <img src="${coverImage}" alt="${favorite.title}" class="w-12 h-16 object-cover rounded-md shadow-sm">
                        </div>
                        
                        <!-- Book Info -->
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-800 dark:text-white text-sm mb-1 line-clamp-2 leading-tight">
                                ${favorite.title}
                            </h3>
                            <p class="text-gray-600 dark:text-gray-300 text-xs mb-1">by ${favorite.author}</p>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                    ${favorite.category_name}
                                </span>
                                <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                    <span>${favorite.rating || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center justify-between gap-2">
                        <button class="view-comments-btn px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                onclick="event.stopPropagation(); window.openBookModal(${bookObjectJson})" title="View book details and comments">
                            <i class="fas fa-comment text-xs"></i>
                            View Details & Comments
                        </button>
                        
                        <button class="remove-favorite-btn px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-md text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                onclick="event.stopPropagation(); window.favoritesManager.removeFavorite('${favorite.id}')" title="Remove from favorites">
                            <i class="fas fa-heart-broken text-xs"></i>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadFavoriteCount() {
        try {
            const response = await fetch('../actions/get_user_favorites.php');
            const data = await response.json();
            
            if (data.success) {
                this.updateFavoriteCount(data.favorite_count);
            }
        } catch (error) {
            console.error('Error loading favorite count:', error);
        }
    }

    updateFavoriteCount(count) {
        this.favoriteCount = count;
        const countElement = document.getElementById('favoriteCount');
        if (countElement) {
            countElement.textContent = count;
            countElement.classList.toggle('hidden', count === 0);
        }
    }

    async removeFavorite(bookId) {
        try {
            const response = await fetch('../actions/toggle_favorite.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: bookId,
                    action: 'remove'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.updateFavoriteCount(data.favorite_count);
                this.loadFavorites(); // Refresh the list
                
                // Update any favorite buttons on the page
                this.updateFavoriteButtons(bookId, false);
            } else {
                console.error('Failed to remove favorite:', data.message);
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    }

    updateFavoriteButtons(bookId, isFavorited) {
        // Update favorite buttons throughout the page
        const buttons = document.querySelectorAll(`[data-book-id="${bookId}"].favorite-btn`);
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isFavorited ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
            }
            btn.dataset.favorited = isFavorited;
            
            // Update button styling for book card buttons (small heart buttons)
            if (btn.classList.contains('absolute') && btn.classList.contains('top-2')) {
                // This is a book card favorite button
                if (isFavorited) {
                    btn.classList.add('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                    btn.classList.remove('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                } else {
                    btn.classList.remove('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                    btn.classList.add('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                }
            }
            
            // Update button text if it exists (for modal buttons)
            const textSpan = btn.querySelector('.favorite-text');
            if (textSpan) {
                textSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
            }
            
            // Update button text if it exists (for other buttons)
            const generalTextSpan = btn.querySelector('span');
            if (generalTextSpan && !btn.querySelector('.favorite-text')) {
                generalTextSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
            }
        });
    }

    // Method to be called from other parts of the app
    async toggleFavorite(bookId, currentState) {
        try {
            const action = currentState ? 'remove' : 'add';
            
            const response = await fetch('../actions/toggle_favorite.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: bookId,
                    action: action
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.updateFavoriteCount(data.favorite_count);
                this.updateFavoriteButtons(bookId, data.is_favorited);
                
                // Update global favorites list
                if (data.is_favorited) {
                    // Add to favorites if not already there
                    if (!window.userFavorites) window.userFavorites = [];
                    if (!window.userFavorites.includes(bookId.toString())) {
                        window.userFavorites.push(bookId.toString());
                    }
                } else {
                    // Remove from favorites
                    if (window.userFavorites) {
                        window.userFavorites = window.userFavorites.filter(id => id !== bookId.toString());
                    }
                }
                
                return data.is_favorited;
            } else {
                console.error('Failed to toggle favorite:', data.message);
                return currentState;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return currentState;
        }
    }

    // Method to initialize favorite states for all books on the page
    async initializeFavoriteStates() {
        try {
            const response = await fetch('../actions/get_user_favorites.php');
            const data = await response.json();
            
            if (data.success && data.favorites) {
                const favoriteBookIds = data.favorites.map(fav => fav.id.toString());
                
                // Make favorites available globally for other scripts
                window.userFavorites = favoriteBookIds;
                
                // Update all favorite buttons on the page
                const favoriteButtons = document.querySelectorAll('.favorite-btn');
                
                favoriteButtons.forEach(btn => {
                    const bookId = btn.dataset.bookId;
                    if (bookId && favoriteBookIds.includes(bookId)) {
                        btn.dataset.favorited = 'true';
                        const icon = btn.querySelector('i');
                        if (icon) {
                            icon.className = 'fas fa-heart text-red-500';
                        }
                        
                        // Update button styling for book card buttons (small heart buttons)
                        if (btn.classList.contains('absolute') && btn.classList.contains('top-2')) {
                            // This is a book card favorite button
                            btn.classList.add('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                            btn.classList.remove('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                        }
                        
                        // Update button text if it exists (for modal buttons)
                        const textSpan = btn.querySelector('.favorite-text');
                        if (textSpan) {
                            textSpan.textContent = 'Remove from Favorites';
                        }
                        
                        // Update button text if it exists (for other buttons)
                        const generalTextSpan = btn.querySelector('span');
                        if (generalTextSpan && !btn.querySelector('.favorite-text')) {
                            generalTextSpan.textContent = 'Remove from Favorites';
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing favorite states:', error);
        }
    }

    // Method to refresh favorite state for a specific book
    async refreshFavoriteState(bookId) {
        try {
            // First check if we have global favorites and if this book is in it
            if (window.userFavorites && Array.isArray(window.userFavorites)) {
                const isFavorited = window.userFavorites.includes(bookId.toString());
                
                // Update all favorite buttons for this book
                const buttonsToUpdate = document.querySelectorAll(`[data-book-id="${bookId}"].favorite-btn`);
                
                buttonsToUpdate.forEach(btn => {
                    // Skip buttons that have already been properly set up by setupFavoriteButton
                    if (btn.dataset.setupComplete === 'true') {
                        return;
                    }
                    
                    btn.dataset.favorited = isFavorited.toString();
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = isFavorited ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
                    }
                    
                    // Update button styling for book card buttons (small heart buttons)
                    if (btn.classList.contains('absolute') && btn.classList.contains('top-2')) {
                        // This is a book card favorite button
                        if (isFavorited) {
                            btn.classList.add('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                            btn.classList.remove('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                        } else {
                            btn.classList.remove('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                            btn.classList.add('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                        }
                    }
                    
                    // Update button text if it exists (for modal buttons)
                    const textSpan = btn.querySelector('.favorite-text');
                    if (textSpan) {
                        textSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
                    }
                    
                    // Update button text if it exists (for other buttons)
                    const generalTextSpan = btn.querySelector('span');
                    if (generalTextSpan && !btn.querySelector('.favorite-text')) {
                        generalTextSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
                    }
                    
                    // Also update the button's visual state using the existing updateFavoriteButtonUI function
                    // This ensures the modal button gets the proper styling
                    if (window.updateFavoriteButtonUI && btn.id === 'favoriteBtn') {
                        const favoriteIcon = btn.querySelector('i');
                        const favoriteText = btn.querySelector('.favorite-text');
                        if (favoriteIcon && favoriteText) {
                            window.updateFavoriteButtonUI(btn, favoriteIcon, favoriteText, isFavorited);
                        }
                    }
                });
                return; // Exit early since we used global favorites
            }
            
            // Fallback: fetch from server only if global favorites not available
            const response = await fetch('../actions/get_user_favorites.php');
            const data = await response.json();
            
            if (data.success && data.favorites) {
                const favoriteBookIds = data.favorites.map(fav => fav.id.toString());
                const isFavorited = favoriteBookIds.includes(bookId.toString());
                
                // Update global favorites list
                window.userFavorites = favoriteBookIds;
                
                // Update all favorite buttons for this book
                const buttonsToUpdate = document.querySelectorAll(`[data-book-id="${bookId}"].favorite-btn`);
                
                buttonsToUpdate.forEach(btn => {
                    // Skip buttons that have already been properly set up by setupFavoriteButton
                    if (btn.dataset.setupComplete === 'true') {
                        return;
                    }
                    
                    btn.dataset.favorited = isFavorited.toString();
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = isFavorited ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
                    }
                    
                    // Update button styling for book card buttons (small heart buttons)
                    if (btn.classList.contains('absolute') && btn.classList.contains('top-2')) {
                        // This is a book card favorite button
                        if (isFavorited) {
                            btn.classList.add('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                            btn.classList.remove('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                        } else {
                            btn.classList.remove('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
                            btn.classList.add('hover:bg-red-50', 'dark:hover:bg-red-900/20');
                        }
                    }
                    
                    // Update button text if it exists (for modal buttons)
                    const textSpan = btn.querySelector('.favorite-text');
                    if (textSpan) {
                        textSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
                    }
                    
                    // Update button text if it exists (for other buttons)
                    const generalTextSpan = btn.querySelector('span');
                    if (generalTextSpan && !btn.querySelector('.favorite-text')) {
                        generalTextSpan.textContent = isFavorited ? 'Remove from Favorites' : 'Add to Favorites';
                    }
                    
                    // Also update the button's visual state using the existing updateFavoriteButtonUI function
                    // This ensures the modal button gets the proper styling
                    if (window.updateFavoriteButtonUI && btn.id === 'favoriteBtn') {
                        const favoriteIcon = btn.querySelector('i');
                        const favoriteText = btn.querySelector('.favorite-text');
                        if (favoriteIcon && favoriteText) {
                            window.updateFavoriteButtonUI(btn, favoriteIcon, favoriteText, isFavorited);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error refreshing favorite state:', error);
        }
    }
}

// Initialize favorites manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.userIsLoggedIn) {
        window.favoritesManager = new FavoritesManager();
    }
});

// Global function to toggle favorites from other parts of the app
window.toggleFavorite = async function(bookId, currentState) {
    if (window.favoritesManager) {
        return await window.favoritesManager.toggleFavorite(bookId, currentState);
    }
    return currentState;
};

// Global function to initialize favorite states
window.initializeFavoriteStates = async function() {
    if (window.favoritesManager) {
        await window.favoritesManager.initializeFavoriteStates();
    }
};

// Global function to refresh favorite states for a specific book
window.refreshFavoriteState = function(bookId) {
    if (window.favoritesManager) {
        window.favoritesManager.refreshFavoriteState(bookId);
    }
};

// Global function to force refresh all favorite states
window.refreshAllFavoriteStates = function() {
    if (window.favoritesManager) {
        window.favoritesManager.initializeFavoriteStates();
    }
};



// Global function to ensure favorites are loaded
window.ensureFavoritesLoaded = async function() {
    if (window.userFavorites && Array.isArray(window.userFavorites)) {
        return true;
    }
    
    // Wait for favorites manager to be available
    let attempts = 0;
    while (!window.favoritesManager && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (window.favoritesManager && window.initializeFavoriteStates) {
        await window.initializeFavoriteStates();
        return true;
    }
    
    return false;
};
