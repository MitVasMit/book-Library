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

  // Make both API calls in parallel for better performance
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
      
      // Filter bestsellers that match the search query
      const matchingBestsellers = bestsellersData.docs.filter(book => {
        const title = book.title?.toLowerCase() || '';
        const author = book.author_name?.[0]?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        // Split query into words for more precise matching
        const queryWords = queryLower.split(' ').filter(word => word.length > 0);
        
        // Check if any query word matches the beginning of title or author
        return queryWords.some(word => 
          title.startsWith(word) || 
          author.startsWith(word) ||
          title.includes(' ' + word) || // Word after a space
          author.includes(' ' + word)   // Word after a space
        );
      });

      // Convert bestsellers to match our search result format
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
      return []; // Return empty array if bestsellers fail
    });

  // Wait for both promises to complete
  Promise.all([searchPromise, bestsellersPromise])
    .then(([searchResults, bestsellersResults]) => {
      // Combine all results
      const allResults = [...searchResults, ...bestsellersResults];
      
      console.log('Combined results:', allResults);

      // Remove duplicates based on title and author
      const uniqueResults = allResults.filter((book, index, self) => 
        index === self.findIndex(b => 
          b.title === book.title && b.author === book.author
        )
      );

      // Display all results
      if (uniqueResults.length === 0) {
        bookList.innerHTML =
          '<p class="text-center col-span-full text-gray-500">No results found.</p>';
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

        // Create rating badge for search results
        const rating = parseFloat(book.rating) || 0;
        const ratingCount = book.rating_count || book.ratings_count || book.ratings?.count || 0;
        console.log('Search book data:', book);
        console.log('Rating for search result:', rating, 'Count:', ratingCount);
        
        // Show rating badge only if there's an actual rating
        const ratingBadge = rating > 0 ? `
          <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
            <span>★</span>
            <span>${rating.toFixed(1)}</span>
          </div>
        ` : '';

        // Add source indicator for bestsellers
        const sourceBadge = book.source === 'Bestsellers' ? `
          <div class="absolute top-2 bg-blue-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md z-10" style="left: 8px;">
            🔥
          </div>
        ` : '';

        if (book.cover_image) {
          item.innerHTML = `
            <div class="relative w-full">
              ${ratingBadge}
              ${sourceBadge}
              <div class="flex flex-col items-center">
                <img src="/book-Library/uploads/${book.cover_image}" alt="${book.title}"
                    class="w-[120px] h-[180px] object-contain mb-4 p-2 bg-white rounded shadow pointer-events-none" />
                <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center pointer-events-none">${book.title}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 text-center pointer-events-none">${book.author}</p>
              </div>
            </div>
          `;
        } else if (book.cover_id) {
          item.innerHTML = `
            <div class="relative w-full">
              ${ratingBadge}
              ${sourceBadge}
              <div class="flex flex-col items-center">
                <img src="https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg" alt="${book.title}"
                    class="w-[120px] h-[180px] object-contain mb-4 p-2 bg-white rounded shadow pointer-events-none" />
                <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center pointer-events-none">${book.title}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 text-center pointer-events-none">${book.author}</p>
              </div>
            </div>
          `;
        } else {
          item.innerHTML = `
            <div class="relative w-full">
              ${sourceBadge}
              <div class="flex flex-col items-center">
                <div class="w-full max-w-[150px] h-[200px] flex items-center justify-center bg-gray-200 dark:bg-gray-600 mb-4 rounded text-gray-500 dark:text-gray-400 italic text-center px-2 pointer-events-none">
                  No cover available from this book.
                </div>
                <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center pointer-events-none">${book.title}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 text-center pointer-events-none">${book.author}</p>
              </div>
            </div>
          `;
        }

        bookList.appendChild(item);
      });
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
