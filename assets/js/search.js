let debounceTimeout;
const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("book-list");
const pagination = document.getElementById("pagination");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    const query = searchInput.value.trim();

    debounceTimeout = setTimeout(() => {
      fetchBooks(query);
    }, 300);
  });
}

function fetchBooks(query) {
  pagination.classList.add("hidden");
  const loader = document.getElementById("book-list-loader");
  loader.classList.remove("hidden");
  bookList.innerHTML = "";

  console.log('Searching for:', query);
  console.log('Search URL:', "/book-Library/actions/book_search.php?q=" + encodeURIComponent(query));

  const currentFilters = window.bookFilters ? window.bookFilters.getCurrentFilters() : null;
  console.log('Current filters:', currentFilters);

  const searchPromise = fetch("/book-Library/actions/book_search.php?q=" + encodeURIComponent(query))
    .then((response) => {
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Search response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data || [];
    });

  const bestsellersPromise = fetch("https://openlibrary.org/search.json?q=bestsellers&limit=20") // Reduced from 50 to 20
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((bestsellersData) => {
      console.log('Bestsellers data:', bestsellersData);
      
      if (!bestsellersData || !bestsellersData.docs) {
        return [];
      }
      
      const matchingBestsellers = bestsellersData.docs.filter(book => {
        const title = book.title?.toLowerCase() || '';
        const author = book.author_name?.[0]?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        const queryWords = queryLower.split(' ').filter(word => word.length > 0);
        
        return queryWords.some(word => 
          title.startsWith(word) || 
          author.startsWith(word) ||
          title.includes(' ' + word) || 
          author.includes(' ' + word)   
        );
      });

      return matchingBestsellers.map(book => ({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        cover_id: book.cover_i,
        cover_image: null,
        source: 'Bestsellers',
        rating: 0,
        key: book.key || null
      }));
    })
    .catch((err) => {
      console.error('Bestsellers fetch error:', err);
      return []; 
    });

  Promise.all([searchPromise, bestsellersPromise])
    .then(([searchResults, bestsellersResults]) => {
      let allResults = [...searchResults, ...bestsellersResults];
      
      console.log('Combined results before filtering:', allResults);

      if (currentFilters) {
        allResults = applyFiltersToResults(allResults, currentFilters);
        console.log('Results after filtering:', allResults);
      }

      const uniqueResults = allResults.filter((book, index, self) => 
        index === self.findIndex(b => 
          b.title === book.title && b.author === book.author
        )
      );

      if (currentFilters && (currentFilters.sortBy !== 'title' || currentFilters.sortOrder !== 'asc')) {
        sortResults(uniqueResults, currentFilters.sortBy, currentFilters.sortOrder);
      }

      if (uniqueResults.length === 0) {
        bookList.innerHTML =
          '<p class="text-center col-span-full text-gray-500">No results found matching your search and filters.</p>';
        return;
      }

      uniqueResults.forEach((book) => {
        const item = document.createElement("div");
        item.className =
          "bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mx-auto flex flex-col items-center w-full max-w-[160px] min-h-[320px] hover:scale-105 transition duration-300 ease-in-out cursor-pointer relative";

        item.addEventListener('click', () => {
          console.log('Search result clicked:', book);
          console.log('openBookModal function available:', typeof window.openBookModal);
          
          const bookData = {
            id: book.id || null,
            title: book.title,
            authors: [{ name: book.author }],
            cover_id: book.cover_id,
            cover_image: book.cover_image,
            key: book.key || null
          };
          console.log('Book data for modal:', bookData);
          
          if (typeof window.openBookModal === 'function') {
            window.openBookModal(bookData);
          } else {
            console.error('openBookModal function is not available');
          }
        });

        const rating = parseFloat(book.rating) || 0;
        const ratingCount = book.rating_count || book.ratings_count || book.ratings?.count || 0;
        console.log('Search book data:', book);
        console.log('Rating for search result:', rating, 'Count:', ratingCount);
        
        const ratingBadge = rating > 0 ? `
          <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
            <span>★</span>
            <span>${rating.toFixed(1)}</span>
          </div>
        ` : '';

        const sourceBadge = book.source === 'Bestsellers' ? `
          <div class="absolute top-2 bg-blue-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md z-10" style="left: 8px;">
            🔥
          </div>
        ` : '';

        // Add favorite button for logged-in users
        const favoriteButton = window.userIsLoggedIn ? `
          <button class="favorite-btn absolute top-2 ${book.source === 'Bestsellers' ? 'left-12' : 'left-2'} bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md z-10 transition-colors duration-200" 
                  data-book-id="${book.id || book.key}" data-favorited="false">
            <i class="far fa-heart"></i>
          </button>
        ` : '';

        if (book.cover_image) {
          item.innerHTML = `
            ${favoriteButton}
            ${sourceBadge}
            ${ratingBadge}
            <img src="/book-Library/uploads/${book.cover_image}" alt="${book.title}" class="w-full h-48 object-cover rounded-lg mb-3">
            <h3 class="font-semibold text-gray-800 dark:text-white text-sm text-center mb-2 line-clamp-2">${book.title}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-xs text-center">by ${book.author}</p>
          `;
        } else if (book.cover_id) {
          item.innerHTML = `
            ${favoriteButton}
            ${sourceBadge}
            ${ratingBadge}
            <img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="${book.title}" class="w-full h-48 object-cover rounded-lg mb-3">
            <h3 class="font-semibold text-gray-800 dark:text-white text-sm text-center mb-2 line-clamp-2">${book.title}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-xs text-center">by ${book.author}</p>
          `;
        } else {
          item.innerHTML = `
            ${favoriteButton}
            ${sourceBadge}
            ${ratingBadge}
            <div class="w-full h-48 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
              <i class="fas fa-book text-4xl text-gray-400 dark:text-gray-500"></i>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-white text-sm text-center mb-2 line-clamp-2">${book.title}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-xs text-center">by ${book.author}</p>
          `;
        }

        // Add favorite button functionality
        if (window.userIsLoggedIn) {
          const favoriteBtn = item.querySelector('.favorite-btn');
          if (favoriteBtn) {
            favoriteBtn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const bookId = favoriteBtn.dataset.bookId;
              const isFavorited = favoriteBtn.dataset.favorited === 'true';
              const newState = await window.toggleFavorite(bookId, isFavorited);
              
              if (newState !== undefined) {
                favoriteBtn.dataset.favorited = newState.toString();
                const icon = favoriteBtn.querySelector('i');
                if (icon) {
                  icon.className = newState ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400';
                }
              }
            });
          }
        }

        bookList.appendChild(item);
      });
      
      // Initialize favorite states after books are displayed
      if (window.userIsLoggedIn && window.initializeFavoriteStates) {
        setTimeout(() => {
          window.initializeFavoriteStates();
        }, 100);
      }
    })
    .catch((err) => {
      console.error('Search fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      bookList.innerHTML = `<p class="text-red-600">Search error occurred: ${err.message}</p>`;
    })
    .finally(() => {
      loader.classList.add("hidden");
    });
}

function applyFiltersToResults(results, filters) {
  return results.filter(book => {
    if (filters.ratingFilter === 'high' && (parseFloat(book.rating) || 0) < 4.0) {
      return false;
    }
    if (filters.ratingFilter === 'low' && (parseFloat(book.rating) || 0) >= 3.0) {
      return false;
    }
    
    if (filters.minRating > 0 && (parseFloat(book.rating) || 0) < filters.minRating) {
      return false;
    }
    
    return true;
  });
}

function sortResults(results, sortBy, sortOrder) {
  results.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'author':
        aValue = a.author?.toLowerCase() || '';
        bValue = b.author?.toLowerCase() || '';
        break;
      case 'rating':
        aValue = parseFloat(a.rating) || 0;
        bValue = parseFloat(b.rating) || 0;
        break;
      case 'date':
        return 0;
      default:
        return 0;
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
}
