class FavoritesManager {
    constructor() {
        this.favoriteCount = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFavoriteCount();
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

        // Add event listeners to remove buttons
        favoritesGrid.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.target.dataset.bookId;
                this.removeFavorite(bookId);
            });
        });
    }

    createFavoriteCard(favorite) {
        const coverImage = favorite.cover_image ? `../uploads/${favorite.cover_image}` : '../assets/images/logo.png';
        
        return `
            <div class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 p-5">
                <div class="flex items-center p-2.5 gap-3">
                    <!-- Cover Image -->
                    <div class="flex-shrink-0">
                        <img src="${coverImage}" alt="${favorite.title}" class="w-10 h-14 object-cover rounded-md shadow-sm">
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
                    
                    <!-- Remove Button -->
                    <div class="flex-shrink-0">
                        <button class="remove-favorite-btn px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-md text-xs font-medium transition-colors duration-200" 
                                data-book-id="${favorite.id}" title="Remove from favorites">
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
