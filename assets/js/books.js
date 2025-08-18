document.addEventListener("DOMContentLoaded", () => {
  const categories = [
    "computer_programming",
    "science",
    "history",
    "fantasy",
    "romance",
    "biography",
    "art",
    "philosophy",
  ];

  const loader = document.getElementById("book-list-loader");
  const bookList = document.getElementById("book-list");
  if (loader) loader.classList.remove("hidden");
  const pagination = document.getElementById("pagination");

  const booksPerPage = 20;
  let currentPage = 1;
  let books = [];

  // Load both OpenLibrary and database books
  loadAllBooks();
  
  async function loadAllBooks() {
    try {
      // Load OpenLibrary books
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const openLibraryResponse = await fetch(`https://openlibrary.org/subjects/${randomCategory}.json?limit=50`);
      const openLibraryData = await openLibraryResponse.json();
      const openLibraryBooks = (openLibraryData.works || []).map(book => ({
        ...book,
        source: 'openlibrary'
      }));
      
      // Load database books
      const databaseResponse = await fetch('/book-Library/actions/get_filtered_books.php');
      const databaseBooks = await databaseResponse.json();
      const formattedDatabaseBooks = databaseBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        published_year: book.published_year,
        pages: book.pages,
        rating: parseFloat(book.rating) || 0,
        cover_image: book.cover_image,
        category_name: book.category_name,
        source: 'database'
      }));
      
      // Combine and sort books
      books = [...formattedDatabaseBooks, ...openLibraryBooks];
      loader.classList.add("hidden");
      renderPage(currentPage);
      setupPagination();
    } catch (err) {
      loader.classList.add("hidden");
      bookList.innerHTML = `<p class="text-red-600">Error loading Books.</p>`;
      console.error(err);
    }
  }

  function renderPage(page) {
    bookList.innerHTML = "";

    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const pageBooks = books.slice(start, end);

    if (pageBooks.length === 0) {
      bookList.innerHTML = `<p class="text-gray-700 dark:text-gray-300">No books to display.</p>`;
      return;
    }

    pageBooks.forEach((book) => {
      // Handle cover images for both book types
      let cover = null;
      if (book.source === 'database' && book.cover_image) {
        cover = `/book-Library/uploads/${book.cover_image}`;
      } else if (book.cover_id) {
        cover = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
      }

      const item = document.createElement("div");
      item.className =
        "bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mx-auto flex flex-col items-center w-full max-w-[160px] min-h-[320px] hover:scale-105 transition duration-300 ease-in-out cursor-pointer relative";

      // Get rating based on book source
      let rating = 0;
      let ratingCount = 0;
      
      if (book.source === 'database') {
        // Database book - use the rating from database
        rating = parseFloat(book.rating) || 0;
        // For now, we'll show a default count, but you could add a rating count field to your database
        ratingCount = rating > 0 ? 1 : 0;
      } else {
        // OpenLibrary book - use API rating
        rating = book.rating_average || book.rating || book.ratings_average || book.ratings?.average || 0;
        ratingCount = book.rating_count || book.ratings_count || book.ratings?.count || 0;
      }

      // Only show rating badge if there's a rating
      const ratingBadge = rating > 0 ? `
        <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
          <span class="text-yellow-800">★</span>
          <span>${rating.toFixed(1)}</span>
          ${ratingCount > 0 ? `<span class="text-xs opacity-75 text-yellow-800">(${ratingCount})</span>` : ''}
        </div>
      ` : '';

      // Add favorite button for logged-in users
      const favoriteButton = window.userIsLoggedIn ? `
        <button class="favorite-btn absolute top-2 left-2 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md z-10 transition-colors duration-200" 
                data-book-id="${book.source === 'database' ? book.id : book.key}" data-favorited="false">
          <i class="far fa-heart"></i>
        </button>
      ` : '';

      if (cover) {
        item.innerHTML = `
      <div class="relative w-full">
        ${favoriteButton}
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <img src="${cover}" alt="${book.title}" 
         class="w-[120px] h-[180px] object-contain mb-4 p-2 bg-white rounded shadow" />

          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.source === 'database' ? book.author : (book.authors?.[0]?.name || "Unknown Author")
          }</p>
          ${book.source === 'database' && book.category_name ? `<p class="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">${book.category_name}</p>` : ''}
        </div>
      </div>
    `;
      } else {
        item.innerHTML = `
      <div class="relative w-full">
        ${favoriteButton}
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <div class="w-full max-w-[150px] h-[200px] flex items-center justify-center bg-gray-200 dark:bg-gray-600 mb-4 rounded text-gray-500 dark:text-gray-400 italic text-center px-2">
            No cover available from this book.
          </div>
          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.source === 'database' ? book.author : (book.authors?.[0]?.name || "Unknown Author")
          }</p>
          ${book.source === 'database' && book.category_name ? `<p class="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">${book.category_name}</p>` : ''}
        </div>
      </div>
    `;
      }

      // Add click event for opening book modal
      item.addEventListener('click', (e) => {
        // Don't open modal if clicking on favorite button
        if (e.target.closest('.favorite-btn')) {
          return;
        }
        
        console.log("Book clicked:", book);
        window.openBookModal(book);
      });

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
  }

  function setupPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(books.length / booksPerPage);

    const paginationContainer = document.createElement("div");
    paginationContainer.className =
      "flex items-center justify-end space-x-2 w-full";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.className =
      "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300 text-white rounded-md transition-colors duration-200 text-sm font-medium";
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        setupPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    const pageInfo = document.createElement("div");
    pageInfo.className =
      "text-xs text-gray-700 dark:text-gray-300 font-medium px-2";
    pageInfo.innerHTML = `Page <span class="font-bold text-blue-600 dark:text-blue-400">${currentPage}</span> of <span class="font-bold">${totalPages}</span>`;

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.className =
      "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300 text-white rounded-md transition-colors duration-200 text-sm font-medium";
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        setupPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
    pagination.appendChild(paginationContainer);
  }

  let touchStartX = 0;
  let touchEndX = 0;

  window.openBookModal = function (book) {
    const modal = document.getElementById("bookModal");
    const bookElement = document.getElementById("book");
    const closeBtn = document.getElementById("closeBtn");
    const coverElement = document.querySelector(".cover");

    document.getElementById("bookTitle").textContent = book.title;
    document.getElementById("bookAuthor").textContent = `Author: ${
      book.source === 'database' ? book.author : (book.authors?.[0]?.name || "Unknown Author")
    }`;
    document.getElementById("coverTitle").textContent = book.title;
    document.getElementById("coverAuthor").textContent =
      book.source === 'database' ? book.author : (book.authors?.[0]?.name || "Unknown Author");

    coverElement.style.background = "#8b5e3c";
    coverElement.style.backgroundImage = "none";

    modal.style.display = "flex";

    closeBtn.style.opacity = "0";
    closeBtn.style.transition = "none";
    void closeBtn.offsetWidth;

    setTimeout(() => {
      bookElement.classList.add("opened");
    }, 10);

    setTimeout(() => {
      closeBtn.style.transition = "opacity 0.4s ease";
      closeBtn.style.opacity = "1";
    }, 400);

    modal.addEventListener("click", handleModalClick);

    if (book.cover_image) {
      const coverImageUrl = `/book-Library/uploads/${book.cover_image}`;
      coverElement.style.background = `linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.08)), url(${coverImageUrl})`;
      coverElement.style.backgroundSize = "cover";
      coverElement.style.backgroundPosition = "center";
      coverElement.style.backgroundRepeat = "no-repeat";
    } else if (book.cover_id) {
      const coverImageUrl = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
      coverElement.style.background = `linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.08)), url(${coverImageUrl})`;
      coverElement.style.backgroundSize = "cover";
      coverElement.style.backgroundPosition = "center";
      coverElement.style.backgroundRepeat = "no-repeat";
    } else {
      coverElement.style.background = "#8b5e3c";
      coverElement.style.backgroundImage = "none";
    }

    if (book.key) {
      loadBookRating(book.key);
      setupRatingSystem(book);
    } else if (book.cover_image) {
      // This is a database book - load database rating
      const bookId = getBookIdForReview(book);
      if (bookId) {
        loadDatabaseBookRating(bookId);
        setupDatabaseRatingSystem(book, bookId);
      }
    }

    // Handle review functionality for database books
    if (book.cover_image) {
      // This is a database book - show review section
      console.log('Opening database book for review:', book); // Debug log
      document.getElementById('reviewSection').classList.remove('hidden');
      document.getElementById('reviewsSection').classList.remove('hidden');
      
      // Reset review form
      resetReviewForm();
      
      // Check if user is logged in
      if (typeof userIsLoggedIn !== "undefined" && userIsLoggedIn) {
        document.getElementById('reviewForm').classList.remove('hidden');
        document.getElementById('reviewLoginPrompt').classList.add('hidden');
        setupReviewSystem(book);
      } else {
        document.getElementById('reviewForm').classList.add('hidden');
        document.getElementById('reviewLoginPrompt').classList.remove('hidden');
      }
      
      // Load existing reviews
      const bookId = getBookIdForReview(book);
      console.log('Book ID for reviews:', bookId); // Debug log
      loadBookReviews(bookId);
    } else {
      // This is an API book - hide review section
      document.getElementById('reviewSection').classList.add('hidden');
      document.getElementById('reviewsSection').classList.add('hidden');
    }

    // Handle favorite functionality
    if (typeof userIsLoggedIn !== "undefined" && userIsLoggedIn) {
      document.getElementById('favoriteSection').classList.remove('hidden');
      document.getElementById('favoriteBtn').style.display = 'inline-flex';
      document.getElementById('favoriteLoginPrompt').classList.add('hidden');
      
      // Set up favorite button
      setupFavoriteButton(book);
    } else {
      document.getElementById('favoriteSection').classList.remove('hidden');
      document.getElementById('favoriteBtn').style.display = 'none';
      document.getElementById('favoriteLoginPrompt').classList.remove('hidden');
    }

    if (book.key) {
      fetch(`https://openlibrary.org${book.key}.json`)
        .then((response) => response.json())
        .then((data) => {
          if (data.description) {
            const description =
              typeof data.description === "string"
                ? data.description
                : data.description.value;
            document.getElementById("bookDescription").textContent =
              description;
          }
          if (data.number_of_pages_median) {
            document.getElementById(
              "bookDetails"
            ).textContent = `Pages: ${data.number_of_pages_median}`;
          }
        })
        .catch((err) => {
          console.log("Could not fetch book details");
        });
    }
  };

  function setupFavoriteButton(book) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteIcon = favoriteBtn.querySelector('i');
    const favoriteText = favoriteBtn.querySelector('.favorite-text');
    
    // Get book ID for database books or key for API books
    let bookId = null;
    if (book.cover_image) {
      // Database book
      bookId = book.id;
    } else if (book.key) {
      // API book - we'll use the key as identifier
      bookId = book.key;
    }
    
    if (!bookId) return;
    
    // Set data attributes
    favoriteBtn.dataset.bookId = bookId;
    favoriteBtn.dataset.favorited = 'false';
    
    // Check if book is already favorited
    checkFavoriteStatus(bookId, favoriteBtn, favoriteIcon, favoriteText);
    
    // Add click event
    favoriteBtn.addEventListener('click', async () => {
      const isFavorited = favoriteBtn.dataset.favorited === 'true';
      const newState = await window.toggleFavorite(bookId, isFavorited);
      
      if (newState !== undefined) {
        favoriteBtn.dataset.favorited = newState.toString();
        updateFavoriteButtonUI(favoriteBtn, favoriteIcon, favoriteText, newState);
      }
    });
  }

  function checkFavoriteStatus(bookId, favoriteBtn, favoriteIcon, favoriteText) {
    // For now, we'll assume not favorited and let the user toggle
    // In a real implementation, you'd check against the user's favorites
    favoriteBtn.dataset.favorited = 'false';
    updateFavoriteButtonUI(favoriteBtn, favoriteIcon, favoriteText, false);
  }

  function updateFavoriteButtonUI(favoriteBtn, favoriteIcon, favoriteText, isFavorited) {
    if (isFavorited) {
      favoriteIcon.className = 'fas fa-heart text-red-500';
      favoriteText.textContent = 'Remove from Favorites';
      favoriteBtn.classList.add('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
      favoriteBtn.classList.remove('hover:bg-red-50', 'dark:hover:bg-red-900/20');
    } else {
      favoriteIcon.className = 'far fa-heart text-gray-400';
      favoriteText.textContent = 'Add to Favorites';
      favoriteBtn.classList.remove('bg-red-50', 'border-red-300', 'dark:bg-red-900/20', 'dark:border-red-600');
      favoriteBtn.classList.add('hover:bg-red-50', 'dark:hover:bg-red-900/20');
    }
  }

  function handleModalClick(event) {
    const modal = document.getElementById("bookModal");
    const bookWrapper = document.querySelector(".book-wrapper");

    if (event.target === modal) {
      window.closeBook();
    }
  }

  window.closeBook = function () {
    const modal = document.getElementById("bookModal");
    const book = document.getElementById("book");
    const closeBtn = document.getElementById("closeBtn");

    modal.removeEventListener("click", handleModalClick);

    closeBtn.style.transition = "opacity 0.4s ease";
    closeBtn.style.opacity = "0";
    book.classList.remove("opened");

    setTimeout(() => {
      modal.style.display = "none";
    }, 1000);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const leftPage = document.querySelector(".left-page");

    if (leftPage) {
      leftPage.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });

      leftPage.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
      });
    }
  });

  function handleSwipeGesture() {
    const swipeThreshold = 50;

    if (touchEndX - touchStartX > swipeThreshold) {
      window.closeBook();
    }
  }

  function loadBookRating(bookKey) {
    fetch(
      `/book-Library/actions/get_book_rating.php?book_key=${encodeURIComponent(
        bookKey
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error loading rating:", data.error);
          return;
        }

        const avgRatingValue = document.getElementById("avgRatingValue");
        const totalRatings = document.getElementById("totalRatings");
        const avgRatingStars = document.getElementById("avgRatingStars");

        if (!data.total_ratings || data.average_rating === 0) {
          avgRatingValue.textContent = '-.-';
          totalRatings.textContent = '(0 ratings)';
          avgRatingStars.innerHTML = getStarHTML(0, false);
        } else {
          avgRatingValue.textContent = data.average_rating;
          totalRatings.textContent = `(${data.total_ratings} ratings)`;
          avgRatingStars.innerHTML = getStarHTML(data.average_rating, false);
        }

        if (data.user_rating) {
          setUserRating(data.user_rating);
        }
      })
      .catch((err) => {
        console.error("Error loading rating:", err);
      });
  }

  function setupRatingSystem(book) {
    const starButtons = document.querySelectorAll(".star-btn");
    const ratingMessage = document.getElementById("ratingMessage");
    const loginPrompt = document.getElementById("loginPrompt");
    const userRating = document.querySelector(".user-rating");

    if (typeof userIsLoggedIn !== "undefined" && !userIsLoggedIn) {
      if (userRating) userRating.classList.add("hidden");
      if (loginPrompt) loginPrompt.classList.remove("hidden");
      return;
    }

    if (loginPrompt) loginPrompt.classList.add("hidden");
    if (userRating) userRating.classList.remove("hidden");

    starButtons.forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });

    const freshStarButtons = document.querySelectorAll(".star-btn");

    freshStarButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.dataset.rating);
        submitRating(book, rating);
      });

      btn.addEventListener("mouseenter", () => {
        const rating = parseInt(btn.dataset.rating);
        highlightStars(rating);
      });

      btn.addEventListener("mouseleave", () => {
        const currentRating = getCurrentUserRating();
        highlightStars(currentRating);
      });
    });
  }

  function submitRating(book, rating) {
    if (typeof userIsLoggedIn !== "undefined" && !userIsLoggedIn) {
      document.getElementById("loginPrompt").classList.remove("hidden");
      showRatingMessage("Please log in to rate this book.", "error");
      return;
    }
    const ratingData = {
      book_key: book.key,
      book_title: book.title,
      book_author: book.authors?.[0]?.name || "Unknown Author",
      rating: rating,
    };

    fetch("/book-Library/actions/rate_book.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    })
      .then(async (response) => {
        if (response.status === 401) {
          document.getElementById("loginPrompt").classList.remove("hidden");
          showRatingMessage("Please log in to rate this book.", "error");
          return;
        }
        const data = await response.json();
        if (data.success) {
          setUserRating(rating);
          updateAverageRating(data.average_rating, data.total_ratings);
          showRatingMessage("Rating saved successfully!", "success");
        } else {
          showRatingMessage(data.error || "Failed to save rating", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting rating:", err);
        showRatingMessage("Error saving rating", "error");
      });
  }

  function setUserRating(rating) {
    const starButtons = document.querySelectorAll(".star-btn");
    starButtons.forEach((btn, index) => {
      if (index < rating) {
        btn.classList.remove("text-gray-300");
        btn.classList.add("text-yellow-400");
      } else {
        btn.classList.remove("text-yellow-400");
        btn.classList.add("text-gray-300");
      }
    });
  }

  function highlightStars(rating) {
    const starButtons = document.querySelectorAll(".star-btn");
    starButtons.forEach((btn, index) => {
      if (index < rating) {
        btn.classList.remove("text-gray-300");
        btn.classList.add("text-yellow-400");
      } else {
        btn.classList.remove("text-yellow-400");
        btn.classList.add("text-gray-300");
      }
    });
  }

  function getCurrentUserRating() {
    const starButtons = document.querySelectorAll(".star-btn");
    let rating = 0;
    starButtons.forEach((btn) => {
      if (btn.classList.contains("text-yellow-400")) {
        rating++;
      }
    });
    return rating;
  }

  function updateAverageRating(average, total) {
    const avgRatingValue = document.getElementById("avgRatingValue");
    const totalRatings = document.getElementById("totalRatings");
    const avgRatingStars = document.getElementById("avgRatingStars");

    avgRatingValue.textContent = average;
    totalRatings.textContent = `(${total} ratings)`;
    avgRatingStars.innerHTML = getStarHTML(average, false);
  }

  function showRatingMessage(message, type) {
    const ratingMessage = document.getElementById("ratingMessage");
    ratingMessage.textContent = message;
    ratingMessage.className = `text-sm mt-2 ${
      type === "success" ? "text-green-600" : "text-red-600"
    }`;

    setTimeout(() => {
      ratingMessage.textContent = "";
      ratingMessage.className = "text-sm mt-2";
    }, 3000);
  }

  function getStarHTML(rating, interactive = true) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = "";

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        html += '<span class="text-yellow-400">★</span>';
      } else if (i === fullStars && hasHalfStar) {
        html += '<span class="text-yellow-400">★</span>';
      } else {
        html += '<span class="text-gray-300">★</span>';
      }
    }

    return html;
  }

  // Review System Functions
  function setupReviewSystem(book) {
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const reviewComment = document.getElementById('reviewComment');
    
    // Create separate star rating for reviews to avoid conflicts
    let currentReviewRating = 0;
    
    // We'll use the existing star buttons but track review rating separately
    const starButtons = document.querySelectorAll(".star-btn");
    
    // Store original click handlers
    const originalClickHandlers = [];
    starButtons.forEach((btn, index) => {
      originalClickHandlers[index] = btn.onclick;
      
      // Add review rating functionality
      btn.addEventListener('click', (e) => {
        // Only handle review rating if this is a review context
        if (book.cover_image) { // Database book
          currentReviewRating = index + 1;
          highlightStars(currentReviewRating);
          e.stopPropagation(); // Prevent triggering the main rating system
        }
      });
      
      btn.addEventListener('mouseenter', () => {
        if (book.cover_image) { // Database book
          highlightStars(index + 1);
        }
      });
      
      btn.addEventListener('mouseleave', () => {
        if (book.cover_image) { // Database book
          highlightStars(currentReviewRating);
        }
      });
    });
    
    submitReviewBtn.addEventListener('click', () => {
      const comment = reviewComment.value.trim();
      
      if (!comment) {
        showReviewMessage('Please write a review comment', 'error');
        return;
      }
      
      if (currentReviewRating === 0) {
        showReviewMessage('Please select a rating', 'error');
        return;
      }
      
      submitReview(book, currentReviewRating, comment);
    });
  }

  function submitReview(book, rating, comment) {
    const bookId = getBookIdForReview(book);
    
    if (!bookId) {
      showReviewMessage('Could not identify book for review. Please try refreshing the page.', 'error');
      console.error('Book object for review:', book);
      return;
    }
    
    const reviewData = {
      book_id: bookId,
      rating: rating,
      comment: comment
    };
    
    fetch('/book-Library/actions/submit_review.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showReviewMessage(data.message, 'success');
        document.getElementById('reviewComment').value = '';
        // Reload reviews to show the new one
        loadBookReviews(bookId);
      } else {
        showReviewMessage(data.error || 'Failed to submit review', 'error');
      }
    })
    .catch(err => {
      console.error('Error submitting review:', err);
      showReviewMessage('Error submitting review', 'error');
    });
  }

  function loadBookReviews(bookId) {
    if (!bookId) return;
    
    fetch(`/book-Library/actions/get_reviews.php?book_id=${bookId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayReviews(data.reviews);
        }
      })
      .catch(err => {
        console.error('Error loading reviews:', err);
      });
  }

  function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
      reviewsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to review this book!</p>';
      return;
    }
    
    // Show only the most recent review
    const latestReview = reviews[0]; // Assuming reviews are sorted by date desc
    
    let reviewsHTML = `
      <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400">
              ${getStarHTML(latestReview.rating, false)}
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">${latestReview.user_name}</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(latestReview.created_at).toLocaleDateString()}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${latestReview.comment}</p>
      </div>
    `;
    
    // Add "read more reviews" link if there are more than 1 review
    if (reviews.length > 1) {
      reviewsHTML += `
        <div class="text-center">
          <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Read ${reviews.length - 1} more review${reviews.length > 2 ? 's' : ''}
          </button>
        </div>
      `;
    }
    
    reviewsList.innerHTML = reviewsHTML;
    
    // Add event listener for "read more reviews" button
    const showAllReviewsBtn = document.getElementById('showAllReviewsBtn');
    if (showAllReviewsBtn) {
      showAllReviewsBtn.addEventListener('click', () => {
        showAllReviews(reviews);
      });
    }
  }

  function showAllReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const showAllReviewsBtn = document.getElementById('showAllReviewsBtn');
    
    // Add loading state to button
    if (showAllReviewsBtn) {
      showAllReviewsBtn.classList.add('loading');
      showAllReviewsBtn.textContent = 'Loading...';
    }
    
    // First, fade out the current content
    const currentContent = reviewsList.querySelector('.review-item');
    if (currentContent) {
      currentContent.classList.remove('show');
      currentContent.classList.add('hide');
    }
    
    // Wait for fade out, then show all reviews
    setTimeout(() => {
      let allReviewsHTML = '';
      
      reviews.forEach((review, index) => {
        allReviewsHTML += `
          <div class="review-item ${index === 0 ? 'show' : ''} bg-gray-50 dark:bg-gray-700 rounded-lg p-3 ${index > 0 ? 'mt-3' : ''}">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="flex text-yellow-400">
                  ${getStarHTML(review.rating, false)}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${review.user_name}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">${review.comment}</p>
          </div>
        `;
      });
      
      // Add "show less" button
      allReviewsHTML += `
        <div class="text-center mt-3">
          <button id="showLessReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Show Less
          </button>
        </div>
      `;
      
      reviewsList.innerHTML = allReviewsHTML;
      
      // Animate in the additional reviews with staggered delay
      const reviewItems = reviewsList.querySelectorAll('.review-item');
      reviewItems.forEach((item, index) => {
        if (index > 0) { // Skip the first one (already visible)
          setTimeout(() => {
            item.classList.add('show');
          }, index * 100); // Stagger the animation
        }
      });
      
      // Add event listener for "show less" button
      const showLessReviewsBtn = document.getElementById('showLessReviewsBtn');
      if (showLessReviewsBtn) {
        showLessReviewsBtn.addEventListener('click', () => {
          showLessReviews(reviews); // Use the new smooth function
        });
      }
    }, 200); // Wait for fade out animation
  }

  function showLessReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const showLessReviewsBtn = document.getElementById('showLessReviewsBtn');
    
    // Add loading state to button
    if (showLessReviewsBtn) {
      showLessReviewsBtn.classList.add('loading');
      showLessReviewsBtn.textContent = 'Loading...';
    }
    
    // Fade out all reviews except the first one
    const reviewItems = reviewsList.querySelectorAll('.review-item');
    reviewItems.forEach((item, index) => {
      if (index > 0) { // Skip the first one
        item.classList.remove('show');
        item.classList.add('hide');
      }
    });
    
    // Wait for fade out, then show only the first review
    setTimeout(() => {
      // Show only the most recent review
      const latestReview = reviews[0];
      
      let reviewsHTML = `
        <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="flex text-yellow-400">
                ${getStarHTML(latestReview.rating, false)}
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">${latestReview.user_name}</span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(latestReview.created_at).toLocaleDateString()}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">${latestReview.comment}</p>
        </div>
      `;
      
      // Add "read more reviews" link if there are more than 1 review
      if (reviews.length > 1) {
        reviewsHTML += `
          <div class="text-center">
            <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
              Read ${reviews.length - 1} more review${reviews.length > 2 ? 's' : ''}
            </button>
          </div>
        `;
      }
      
      reviewsList.innerHTML = reviewsHTML;
      
      // Add event listener for "read more reviews" button
      const showAllReviewsBtn = document.getElementById('showAllReviewsBtn');
      if (showAllReviewsBtn) {
        showAllReviewsBtn.addEventListener('click', () => {
          showAllReviews(reviews);
        });
      }
    }, 200); // Wait for fade out animation
  }

  function getBookIdFromTitle(title) {
    // This is a fallback - ideally we should have the book ID
    // For now, we'll try to find it in the current books array
    const book = books.find(b => b.title === title);
    return book ? book.id : null;
  }

  // Better book ID detection function
  function getBookIdForReview(book) {
    // First try to get the ID directly from the book object
    if (book.id) {
      return book.id;
    }
    
    // If no ID, try to find it by title in the current books array
    if (book.title) {
      const foundBook = books.find(b => b.title === book.title);
      if (foundBook && foundBook.id) {
        return foundBook.id;
      }
    }
    
    // If still no ID, try to get it from the DOM or other sources
    // For now, return null and show a helpful error
    console.warn('Could not find book ID for:', book);
    return null;
  }

  function showReviewMessage(message, type) {
    const reviewMessage = document.getElementById('reviewMessage');
    reviewMessage.textContent = message;
    reviewMessage.className = `text-sm mt-2 ${
      type === 'success' ? 'text-green-600' : 'text-red-600'
    }`;

    setTimeout(() => {
      reviewMessage.textContent = '';
      reviewMessage.className = 'text-sm mt-2';
    }, 3000);
  }

  function resetReviewForm() {
    // Reset comment field
    const reviewComment = document.getElementById('reviewComment');
    if (reviewComment) {
      reviewComment.value = '';
    }
    
    // Reset rating message
    const reviewMessage = document.getElementById('reviewMessage');
    if (reviewMessage) {
      reviewMessage.textContent = '';
      reviewMessage.className = 'text-sm mt-2';
    }
    
    // Reset stars to default state (gray) - but only if this is a review context
    // We don't want to interfere with the main rating system
    if (document.getElementById('reviewSection').classList.contains('hidden') === false) {
      const starButtons = document.querySelectorAll(".star-btn");
      starButtons.forEach((btn) => {
        btn.classList.remove("text-yellow-400");
        btn.classList.add("text-gray-300");
      });
    }
  }

  // Database Book Rating Functions
  function loadDatabaseBookRating(bookId) {
    fetch(`/book-Library/actions/get_database_book_rating.php?book_id=${bookId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          updateDatabaseBookRating(data);
        }
      })
      .catch(err => {
        console.error('Error loading database book rating:', err);
      });
  }

  function updateDatabaseBookRating(data) {
    const avgRatingValue = document.getElementById("avgRatingValue");
    const totalRatings = document.getElementById("totalRatings");
    const avgRatingStars = document.getElementById("avgRatingStars");
    const ratingLabel = document.getElementById("ratingLabel");

    if (!data.total_ratings || data.average_rating === 0) {
      avgRatingValue.textContent = '0.0';
      totalRatings.textContent = '(0 ratings)';
      avgRatingStars.innerHTML = getStarHTML(0, false);
      ratingLabel.textContent = 'Rate this book:';
    } else {
      avgRatingValue.textContent = data.average_rating;
      totalRatings.textContent = `(${data.total_ratings} ratings)`;
      avgRatingStars.innerHTML = getStarHTML(data.average_rating, false);
      
      // Change label text if user has rated
      if (data.user_rating) {
        ratingLabel.textContent = 'Your Rating for this book:';
      } else {
        ratingLabel.textContent = 'Rate this book:';
      }
    }

    if (data.user_rating) {
      setUserRating(data.user_rating);
    }
  }

  function setupDatabaseRatingSystem(book, bookId) {
    const starButtons = document.querySelectorAll(".star-btn");
    const ratingMessage = document.getElementById("ratingMessage");
    const loginPrompt = document.getElementById("loginPrompt");
    const userRating = document.querySelector(".user-rating");

    if (typeof userIsLoggedIn !== "undefined" && !userIsLoggedIn) {
      if (userRating) userRating.classList.add("hidden");
      if (loginPrompt) loginPrompt.classList.remove("hidden");
      return;
    }

    if (loginPrompt) loginPrompt.classList.add("hidden");
    if (userRating) userRating.classList.remove("hidden");

    starButtons.forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });

    const freshStarButtons = document.querySelectorAll(".star-btn");

    freshStarButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.dataset.rating);
        submitDatabaseBookRating(book, bookId, rating);
      });

      btn.addEventListener("mouseenter", () => {
        const rating = parseInt(btn.dataset.rating);
        highlightStars(rating);
      });

      btn.addEventListener("mouseleave", () => {
        const currentRating = getCurrentUserRating();
        highlightStars(currentRating);
      });
    });
  }

  function submitDatabaseBookRating(book, bookId, rating) {
    if (typeof userIsLoggedIn !== "undefined" && !userIsLoggedIn) {
      document.getElementById("loginPrompt").classList.remove("hidden");
      showRatingMessage("Please log in to rate this book.", "error");
      return;
    }

    const ratingData = {
      book_id: bookId,
      rating: rating
    };

    fetch("/book-Library/actions/rate_database_book.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    })
      .then(async (response) => {
        if (response.status === 401) {
          document.getElementById("loginPrompt").classList.remove("hidden");
          showRatingMessage("Please log in to rate this book.", "error");
          return;
        }
        const data = await response.json();
        if (data.success) {
          setUserRating(rating);
          updateDatabaseBookRating(data);
          showRatingMessage("Rating saved successfully!", "success");
          
          // Update the label to show "Your Rating"
          const ratingLabel = document.getElementById("ratingLabel");
          ratingLabel.textContent = 'Your Rating for this book:';
        } else {
          showRatingMessage(data.error || "Failed to save rating", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting database book rating:", err);
        showRatingMessage("Error saving rating", "error");
      });
  }
});
