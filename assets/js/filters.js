class BookFilters {
    constructor() {
        this.currentFilters = {
            categories: [],
            newBooks: false,
            ratingFilter: 'all',
            minRating: 0,
            sortBy: 'title',
            sortOrder: 'asc'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCategories();
        this.updateActiveFiltersDisplay();
    }

    bindEvents() {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.openFilterModal());
        }

        const closeFilterModal = document.getElementById('closeFilterModal');
        const cancelFilter = document.getElementById('cancelFilter');
        if (closeFilterModal) {
            closeFilterModal.addEventListener('click', () => this.closeFilterModal());
        }
        if (cancelFilter) {
            cancelFilter.addEventListener('click', () => this.closeFilterModal());
        }

        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => this.handleFilterSubmit(e));
        }

        const clearAllFilters = document.getElementById('clearAllFilters');
        if (clearAllFilters) {
            clearAllFilters.addEventListener('click', () => this.clearAllFilters());
        }

        const minRating = document.getElementById('minRating');
        if (minRating) {
            minRating.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('minRatingValue').textContent = value;
                this.currentFilters.minRating = parseFloat(value);
            });
        }

        this.bindCategoryEvents();
    }

    bindCategoryEvents() {
        const categoryFilters = document.getElementById('categoryFilters');
        if (categoryFilters) {
            categoryFilters.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    const categoryId = e.target.value;
                    if (e.target.checked) {
                        if (!this.currentFilters.categories.includes(categoryId)) {
                            this.currentFilters.categories.push(categoryId);
                        }
                    } else {
                        this.currentFilters.categories = this.currentFilters.categories.filter(id => id !== categoryId);
                    }
                }
            });
        }
    }

    openFilterModal() {
        const modal = document.getElementById('filterModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateCurrentFilters();
        }
    }

    closeFilterModal() {
        const modal = document.getElementById('filterModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    populateCurrentFilters() {
        const newBooks = document.getElementById('newBooks');
        if (newBooks) {
            newBooks.checked = this.currentFilters.newBooks;
        }

        const ratingRadios = document.querySelectorAll('input[name="ratingFilter"]');
        ratingRadios.forEach(radio => {
            if (radio.value === this.currentFilters.ratingFilter) {
                radio.checked = true;
            }
        });

        const minRating = document.getElementById('minRating');
        if (minRating) {
            minRating.value = this.currentFilters.minRating;
            document.getElementById('minRatingValue').textContent = this.currentFilters.minRating;
        }

        const sortByRadios = document.querySelectorAll('input[name="sortBy"]');
        sortByRadios.forEach(radio => {
            if (radio.value === this.currentFilters.sortBy) {
                radio.checked = true;
            }
        });

        const sortOrderRadios = document.querySelectorAll('input[name="sortOrder"]');
        sortOrderRadios.forEach(radio => {
            if (radio.value === this.currentFilters.sortOrder) {
                radio.checked = true;
            }
        });

        this.updateCategoryCheckboxes();
    }

    updateCategoryCheckboxes() {
        const categoryFilters = document.getElementById('categoryFilters');
        if (categoryFilters) {
            const checkboxes = categoryFilters.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.currentFilters.categories.includes(checkbox.value);
            });
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/book-Library/actions/get_categories.php');
            const categories = await response.json();
            
            if (categories && categories.length > 0) {
                this.renderCategories(categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories(categories) {
        const categoryFilters = document.getElementById('categoryFilters');
        if (categoryFilters) {
            categoryFilters.innerHTML = categories.map(category => `
                <label class="flex items-center">
                    <input type="checkbox" name="categories[]" value="${category.id}" class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="text-sm text-gray-700 dark:text-gray-300">${category.name}</span>
                </label>
            `).join('');
            
            this.bindCategoryEvents();
        }
    }

    handleFilterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        this.currentFilters.categories = Array.from(formData.getAll('categories[]'));
        this.currentFilters.newBooks = formData.get('newBooks') === 'on';
        this.currentFilters.ratingFilter = formData.get('ratingFilter');
        this.currentFilters.minRating = parseFloat(formData.get('minRating')) || 0;
        this.currentFilters.sortBy = formData.get('sortBy');
        this.currentFilters.sortOrder = formData.get('sortOrder');

        this.closeFilterModal();

        this.updateActiveFiltersDisplay();

        this.applyFilters();
    }

    updateActiveFiltersDisplay() {
        const activeFilters = document.getElementById('activeFilters');
        const activeFiltersList = document.getElementById('activeFiltersList');
        const searchActiveFilters = document.getElementById('searchActiveFilters');
        const searchActiveFiltersList = document.getElementById('searchActiveFiltersList');
        
        if (!activeFilters || !activeFiltersList) return;

        const activeFiltersArray = [];
        
        if (this.currentFilters.categories.length > 0) {
            activeFiltersArray.push(`Categories: ${this.currentFilters.categories.length} selected`);
        }
        
        if (this.currentFilters.newBooks) {
            activeFiltersArray.push('New Books (Last Month)');
        }
        
        if (this.currentFilters.ratingFilter !== 'all') {
            activeFiltersArray.push(`Rating: ${this.currentFilters.ratingFilter}`);
        }
        
        if (this.currentFilters.minRating > 0) {
            activeFiltersArray.push(`Min Rating: ${this.currentFilters.minRating}+`);
        }
        
        if (this.currentFilters.sortBy !== 'title' || this.currentFilters.sortOrder !== 'asc') {
            activeFiltersArray.push(`Sort: ${this.currentFilters.sortBy} (${this.currentFilters.sortOrder})`);
        }

        if (activeFiltersArray.length > 0) {
            activeFiltersList.innerHTML = activeFiltersArray.map(filter => 
                `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">${filter}</span>`
            ).join('');
            activeFilters.classList.remove('hidden');
            
            if (searchActiveFilters && searchActiveFiltersList) {
                searchActiveFiltersList.innerHTML = activeFiltersArray.map(filter => 
                    `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">${filter}</span>`
                ).join('');
                searchActiveFilters.classList.remove('hidden');
            }
        } else {
            activeFilters.classList.add('hidden');
            if (searchActiveFilters) {
                searchActiveFilters.classList.add('hidden');
            }
        }
    }

    clearAllFilters() {
        this.currentFilters = {
            categories: [],
            newBooks: false,
            ratingFilter: 'all',
            minRating: 0,
            sortBy: 'title',
            sortOrder: 'asc'
        };
        
        this.updateActiveFiltersDisplay();
        this.applyFilters();
    }

    applyFilters() {
        const searchInput = document.getElementById('searchInput');
        const currentQuery = searchInput ? searchInput.value.trim() : '';
        
        if (currentQuery) {
            if (typeof window.fetchBooks === 'function') {
                window.fetchBooks(currentQuery);
            }
        } else {
            this.loadFilteredBooks();
        }
    }

    async loadFilteredBooks() {
        try {
            const loader = document.getElementById('book-list-loader');
            const bookList = document.getElementById('book-list');
            
            if (loader) loader.classList.remove('hidden');
            if (bookList) bookList.innerHTML = '';

            const params = new URLSearchParams();
            
            if (this.currentFilters.categories.length > 0) {
                this.currentFilters.categories.forEach(cat => params.append('categories[]', cat));
            }
            
            if (this.currentFilters.newBooks) {
                params.append('newBooks', '1');
            }
            
            if (this.currentFilters.ratingFilter !== 'all') {
                params.append('ratingFilter', this.currentFilters.ratingFilter);
            }
            
            if (this.currentFilters.minRating > 0) {
                params.append('minRating', this.currentFilters.minRating);
            }
            
            params.append('sortBy', this.currentFilters.sortBy);
            params.append('sortOrder', this.currentFilters.sortOrder);

            const response = await fetch(`/book-Library/actions/get_filtered_books.php?${params.toString()}`);
            const books = await response.json();

            if (books && books.length > 0) {
                this.renderFilteredBooks(books);
            } else {
                if (bookList) {
                    bookList.innerHTML = '<p class="text-center col-span-full text-gray-500">No books match the selected filters.</p>';
                }
            }
        } catch (error) {
            console.error('Error loading filtered books:', error);
            const bookList = document.getElementById('book-list');
            if (bookList) {
                bookList.innerHTML = '<p class="text-center col-span-full text-red-500">Error loading filtered books.</p>';
            }
        } finally {
            const loader = document.getElementById('book-list-loader');
            if (loader) loader.classList.add('hidden');
        }
    }

    renderFilteredBooks(books) {
        const bookList = document.getElementById('book-list');
        if (!bookList) return;

        bookList.innerHTML = '';

        books.forEach(book => {
            const item = document.createElement("div");
            item.className = "bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mx-auto flex flex-col items-center w-full max-w-[160px] min-h-[320px] hover:scale-105 transition duration-300 ease-in-out cursor-pointer relative";

            const rating = parseFloat(book.rating) || 0;
            const ratingBadge = rating > 0 ? `
                <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
                    <span>★</span>
                    <span>${rating.toFixed(1)}</span>
                </div>
            ` : '';

            if (book.cover_image) {
                item.innerHTML = `
                    <div class="relative w-full">
                        ${ratingBadge}
                        <div class="flex flex-col items-center">
                            <img src="/book-Library/uploads/${book.cover_image}" alt="${book.title}"
                                class="w-[120px] h-[180px] object-contain mb-4 p-2 bg-white rounded shadow pointer-events-none" />
                            <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center pointer-events-none">${book.title}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300 text-center pointer-events-none">${book.author}</p>
                        </div>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div class="relative w-full">
                        ${ratingBadge}
                        <div class="flex flex-col items-center">
                            <div class="w-full max-w-[150px] h-[200px] flex items-center justify-center bg-gray-200 dark:bg-gray-600 mb-4 rounded text-gray-500 dark:text-gray-400 italic text-center px-2 pointer-events-none">
                                No cover available
                            </div>
                            <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center pointer-events-none">${book.title}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300 text-center pointer-events-none">${book.author}</p>
                        </div>
                    </div>
                `;
            }

            item.addEventListener('click', () => {
                if (typeof window.openBookModal === 'function') {
                    const bookData = {
                        title: book.title,
                        authors: [{ name: book.author }],
                        cover_image: book.cover_image,
                        key: null
                    };
                    window.openBookModal(bookData);
                }
            });

            bookList.appendChild(item);
        });
    }

    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    setFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.updateActiveFiltersDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bookFilters = new BookFilters();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookFilters;
}
