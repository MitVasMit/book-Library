document.addEventListener("DOMContentLoaded", () => {
  // CSRF token management
  function getCSRFToken() {
    const tokenField = document.querySelector('input[name="csrf_token"]');
    return tokenField ? tokenField.value : null;
  }

  // Helper function to handle AJAX responses with session timeout detection
  async function handleAjaxResponse(response) {
    // Check for session timeout first
    if (response.status === 401) {
      try {
        const data = await response.json();
        if (data.error === 'Session expired' && data.redirect) {
          window.location.href = data.redirect;
          return null;
        }
      } catch (e) {
        // If we can't parse JSON, it might be a regular 401, redirect anyway
        window.location.href = '/book-Library/public/login.php';
        return null;
      }
    }
    
    return await response.json();
  }

  function safeGetElement(id, fallback = null) {
    const element = document.getElementById(id);
    if (!element && fallback !== null) {
      return fallback;
    }
    return element;
  }

  function safeSetElement(id, property, value, fallback = null) {
    const element = safeGetElement(id, fallback);
    if (element && element[property] !== undefined) {
      try {
        element[property] = value;
      } catch (error) {}
    }
  }

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
  const pagination = document.getElementById("pagination");

  if (!bookList) {
    return;
  }

  if (loader) loader.classList.remove("hidden");

  const booksPerPage = 20;
  let currentPage = 1;
  let books = [];

  loadAllBooks();

  async function loadAllBooks() {
    try {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const openLibraryResponse = await fetch(
        `https://openlibrary.org/subjects/${randomCategory}.json?limit=50`
      );
      const openLibraryData = await openLibraryResponse.json();
      const openLibraryBooks = (openLibraryData.works || []).map((book) => ({
        ...book,
        source: "openlibrary",
      }));

      const databaseResponse = await fetch(
        "/book-Library/actions/get_filtered_books.php"
      );
      const databaseBooks = await databaseResponse.json();
      const formattedDatabaseBooks = databaseBooks.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        published_year: book.published_year,
        pages: book.pages,
        rating: parseFloat(book.rating) || 0,
        cover_image: book.cover_image,
        category_name: book.category_name,
        source: "database",
      }));

      books = [...formattedDatabaseBooks, ...openLibraryBooks];

      if (loader) {
        loader.classList.add("hidden");
      }

      if (window.userIsLoggedIn && window.ensureFavoritesLoaded) {
        try {
          const favoritesLoaded = await window.ensureFavoritesLoaded();
          if (favoritesLoaded) {
          } else {
          }
        } catch (error) {
          console.error("Error initializing favorites:", error);
        }
      } else if (window.userIsLoggedIn && !window.ensureFavoritesLoaded) {
      }

      renderPage(currentPage);
      setupPagination();
    } catch (err) {
      if (loader) {
        loader.classList.add("hidden");
      }
      if (bookList) {
        bookList.innerHTML = `<p class="text-red-600">Error loading Books.</p>`;
      }
      console.error(err);
    }
  }

  function renderPage(page) {
    if (!bookList) {
      return;
    }

    bookList.innerHTML = "";

    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const pageBooks = books.slice(start, end);

    if (pageBooks.length === 0) {
      bookList.innerHTML = `<p class="text-gray-700 dark:text-gray-300">No books to display.</p>`;
      return;
    }

    pageBooks.forEach((book, index) => {
      let cover = null;
      if (book.source === "database" && book.cover_image) {
        cover = `/book-Library/uploads/${book.cover_image}`;
      } else if (book.cover_id) {
        cover = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
      }

      const item = document.createElement("div");
      item.className =
        "bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 mx-auto flex flex-col items-center w-full max-w-[160px] min-h-[320px] hover:scale-105 transition duration-300 ease-in-out cursor-pointer relative";

      let rating = 0;
      let ratingCount = 0;

      if (book.source === "database") {
        rating = parseFloat(book.rating) || 0;
        ratingCount = rating > 0 ? 1 : 0;
      } else {
        rating =
          book.rating_average ||
          book.rating ||
          book.ratings_average ||
          book.ratings?.average ||
          0;
        ratingCount =
          book.rating_count || book.ratings_count || book.ratings?.count || 0;
      }

      const ratingBadge =
        rating > 0
          ? `
        <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
          <span class="text-yellow-800">★</span>
          <span>${rating.toFixed(1)}</span>
          ${
            ratingCount > 0
              ? `<span class="text-xs opacity-75 text-yellow-800">(${ratingCount})</span>`
              : ""
          }
        </div>
      `
          : "";
      const bookIdForButton = book.source === "database" ? book.id : book.key;

      const isFavorited =
        window.userFavorites &&
        window.userFavorites.includes(bookIdForButton.toString());

      const favoriteButton = window.userIsLoggedIn
        ? `
         <button class="favorite-btn absolute top-2 left-2 ${
           isFavorited
             ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600"
             : "bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
         } text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md z-10 transition-colors duration-200" 
                 data-book-id="${bookIdForButton}" data-favorited="${isFavorited}">
           <i class="${
             isFavorited ? "fas fa-heart text-red-500" : "far fa-heart"
           }"></i>
         </button>
       `
        : "";

      if (cover) {
        item.innerHTML = `
      <div class="relative w-full">
        ${favoriteButton}
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <div class="w-[120px] h-[180px] bg-white dark:bg-gray-100 rounded shadow flex items-center justify-center mb-4 p-2">
            <img src="${cover}" alt="${book.title}" 
         class="max-w-full max-h-full object-contain" />
          </div>

          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.source === "database"
              ? book.author
              : book.authors?.[0]?.name || "Unknown Author"
          }</p>
          ${
            book.source === "database" && book.category_name
              ? `<p class="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">${book.category_name}</p>`
              : ""
          }
        </div>
      </div>
    `;
      } else {
        item.innerHTML = `
      <div class="relative w-full">
        ${favoriteButton}
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <div class="w-[120px] h-[180px] flex items-center justify-center bg-gray-200 dark:bg-gray-600 mb-4 rounded shadow text-gray-500 dark:text-gray-400 italic text-center px-2">
            No cover available
          </div>
          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.source === "database"
              ? book.author
              : book.authors?.[0]?.name || "Unknown Author"
          }</p>
          ${
            book.source === "database" && book.category_name
              ? `<p class="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">${book.category_name}</p>`
              : ""
          }
        </div>
      </div>
    `;
      }

      item.addEventListener("click", (e) => {
        if (e.target.closest(".favorite-btn")) {
          return;
        }

        window.openBookModal(book);
      });

      if (window.userIsLoggedIn) {
        const favoriteBtn = item.querySelector(".favorite-btn");
        if (favoriteBtn) {
          const bookId = favoriteBtn.dataset.bookId;

          favoriteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const isFavorited = favoriteBtn.dataset.favorited === "true";

            if (window.toggleFavorite) {
              const newState = await window.toggleFavorite(bookId, isFavorited);

              if (newState !== undefined) {
                favoriteBtn.dataset.favorited = newState.toString();
                const icon = favoriteBtn.querySelector("i");
                if (icon) {
                  icon.className = newState
                    ? "fas fa-heart text-red-500"
                    : "far fa-heart text-gray-400";
                }

                if (newState) {
                  favoriteBtn.classList.add(
                    "bg-red-50",
                    "border-red-300",
                    "dark:bg-red-900/20",
                    "dark:border-red-600"
                  );
                  favoriteBtn.classList.remove(
                    "hover:bg-red-50",
                    "dark:hover:bg-red-900/20"
                  );
                } else {
                  favoriteBtn.classList.remove(
                    "bg-red-50",
                    "border-red-300",
                    "dark:bg-red-900/20",
                    "dark:border-red-600"
                  );
                  favoriteBtn.classList.add(
                    "hover:bg-red-50",
                    "dark:hover:bg-red-900/20"
                  );
                }
              }
            } else {
            }
          });
        }
      }

      bookList.appendChild(item);
    });
  }

  function setupPagination() {
    if (!pagination) {
      return;
    }

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

    if (!modal || !bookElement || !closeBtn || !coverElement) {
      return;
    }

    const bookTitle = document.getElementById("bookTitle");
    const bookAuthor = document.getElementById("bookAuthor");
    const coverTitle = document.getElementById("coverTitle");
    const coverAuthor = document.getElementById("coverAuthor");

    if (bookTitle) bookTitle.textContent = book.title;
    if (bookAuthor)
      bookAuthor.textContent =
        book.source === "database"
          ? book.author
          : book.authors?.[0]?.name || "Unknown Author";
    if (coverTitle) coverTitle.textContent = book.title;
    if (coverAuthor)
      coverAuthor.textContent =
        book.source === "database"
          ? book.author
          : book.authors?.[0]?.name || "Unknown Author";

    const categoryElement = document.getElementById("bookCategory");
    if (categoryElement) {
      if (book.source === "database" && book.category_name) {
        categoryElement.textContent = book.category_name;
        categoryElement.style.display = "block";
      } else {
        categoryElement.style.display = "none";
      }
    }

    if (book.source === "database") {
      const pagesElement = document.getElementById("bookPages");
      const yearElement = document.getElementById("bookYear");

      if (pagesElement) {
        if (book.pages) {
          pagesElement.textContent = `${book.pages} pages`;
          pagesElement.style.display = "block";
        } else {
          pagesElement.style.display = "none";
        }
      }

      if (yearElement) {
        if (book.published_year) {
          yearElement.textContent = `Published ${book.published_year}`;
          yearElement.style.display = "block";
        } else {
          yearElement.style.display = "none";
        }
      }

      fetchFavoriteCount(book.id);
    } else {
      const pagesElement = document.getElementById("bookPages");
      const yearElement = document.getElementById("bookYear");
      const favoriteCountElement = document.getElementById("bookFavoriteCount");

      if (pagesElement) pagesElement.style.display = "none";
      if (yearElement) yearElement.style.display = "none";
      if (favoriteCountElement) favoriteCountElement.style.display = "none";
    }

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
      const bookId = getBookIdForReview(book);
      if (bookId) {
        loadDatabaseBookRating(bookId);
        setupDatabaseRatingSystem(book, bookId);
      }
    }

    if (book.cover_image) {
      document.getElementById("reviewSection").classList.remove("hidden");
      document.getElementById("reviewsSection").classList.remove("hidden");

      resetReviewForm();

      if (typeof userIsLoggedIn !== "undefined" && userIsLoggedIn) {
        document.getElementById("reviewForm").classList.remove("hidden");
        document.getElementById("reviewLoginPrompt").classList.add("hidden");
        setupReviewSystem(book);
      } else {
        document.getElementById("reviewForm").classList.add("hidden");
        document.getElementById("reviewLoginPrompt").classList.remove("hidden");
      }

      const bookId = getBookIdForReview(book);
      loadBookReviews(bookId);
    } else {
      document.getElementById("reviewSection").classList.add("hidden");
      document.getElementById("reviewsSection").classList.add("hidden");
    }

    setupPrivateComments(book);

    if (typeof userIsLoggedIn !== "undefined" && userIsLoggedIn) {
      document.getElementById("favoriteSection").classList.remove("hidden");
      document.getElementById("favoriteBtn").style.display = "inline-flex";
      document.getElementById("favoriteLoginPrompt").classList.add("hidden");

      setupFavoriteButton(book).catch((error) => {
        console.error("Error setting up favorite button:", error);
      });
    } else {
      document.getElementById("favoriteSection").classList.remove("hidden");
      document.getElementById("favoriteBtn").style.display = "none";
      document.getElementById("favoriteLoginPrompt").classList.remove("hidden");
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
        .catch((err) => {});
    }
  };

  async function setupFavoriteButton(book) {
    const favoriteBtn = document.getElementById("favoriteBtn");
    if (!favoriteBtn) {
      console.error("Favorite button not found");
      return;
    }

    const favoriteIcon = favoriteBtn.querySelector("i");
    const favoriteText = favoriteBtn.querySelector(".favorite-text");

    if (!favoriteIcon || !favoriteText) {
      console.error("Favorite button icon or text not found");
      return;
    }

    let bookId = null;
    if (book.cover_image) {
      bookId = book.id;
    } else if (book.key) {
      bookId = book.key;
    }

    if (!bookId) {
      console.error("No book ID found for:", book);
      return;
    }

    const newFavoriteBtn = favoriteBtn.cloneNode(true);
    favoriteBtn.parentNode.replaceChild(newFavoriteBtn, favoriteBtn);

    const freshFavoriteBtn = document.getElementById("favoriteBtn");
    const freshFavoriteIcon = freshFavoriteBtn.querySelector("i");
    const freshFavoriteText = freshFavoriteBtn.querySelector(".favorite-text");

    freshFavoriteBtn.dataset.bookId = bookId;

    let isFavorited = false;

    if (window.userFavorites && Array.isArray(window.userFavorites)) {
      isFavorited = window.userFavorites.includes(bookId.toString());
    } else if (window.ensureFavoritesLoaded) {
      const favoritesLoaded = await window.ensureFavoritesLoaded();

      if (
        favoritesLoaded &&
        window.userFavorites &&
        Array.isArray(window.userFavorites)
      ) {
        isFavorited = window.userFavorites.includes(bookId.toString());
      } else {
        try {
          const response = await fetch("../actions/get_user_favorites.php");
          const data = await handleAjaxResponse(response);
          
          if (data && data.success && data.favorites) {
            const favoriteBookIds = data.favorites.map((fav) =>
              fav.id.toString()
            );
            isFavorited = favoriteBookIds.includes(bookId.toString());
          }
        } catch (error) {
          console.error("Error checking favorite state:", error);
        }
      }
    } else {
      try {
        const response = await fetch("../actions/get_user_favorites.php");
        const data = await handleAjaxResponse(response);

        if (data && data.success && data.favorites) {
          const favoriteBookIds = data.favorites.map((fav) =>
            fav.id.toString()
          );
          isFavorited = favoriteBookIds.includes(bookId.toString());
        }
      } catch (error) {
        console.error("Error checking favorite state:", error);
      }
    }

    freshFavoriteBtn.dataset.favorited = isFavorited.toString();

    updateFavoriteButtonUI(
      freshFavoriteBtn,
      freshFavoriteIcon,
      freshFavoriteText,
      isFavorited
    );

    freshFavoriteBtn.dataset.setupComplete = "true";

    freshFavoriteBtn.addEventListener("click", async () => {
      const currentState = freshFavoriteBtn.dataset.favorited === "true";

      if (window.toggleFavorite) {
        const newState = await window.toggleFavorite(bookId, currentState);

        if (newState !== undefined) {
          freshFavoriteBtn.dataset.favorited = newState.toString();
          updateFavoriteButtonUI(
            freshFavoriteBtn,
            freshFavoriteIcon,
            freshFavoriteText,
            newState
          );

          const cardButtons = document.querySelectorAll(
            `[data-book-id="${bookId}"].favorite-btn`
          );

          cardButtons.forEach((btn) => {
            btn.dataset.favorited = newState.toString();
            const icon = btn.querySelector("i");
            if (icon) {
              icon.className = newState
                ? "fas fa-heart text-red-500"
                : "far fa-heart text-gray-400";
            }

            if (
              btn.classList.contains("absolute") &&
              btn.classList.contains("top-2")
            ) {
              if (newState) {
                btn.classList.add(
                  "bg-red-50",
                  "border-red-300",
                  "dark:bg-red-900/20",
                  "dark:border-red-600"
                );
                btn.classList.remove(
                  "hover:bg-red-50",
                  "dark:hover:bg-red-900/20"
                );
              } else {
                btn.classList.remove(
                  "bg-red-50",
                  "border-red-300",
                  "dark:bg-red-900/20",
                  "dark:border-red-600"
                );
                btn.classList.add(
                  "hover:bg-red-50",
                  "dark:hover:bg-red-900/20"
                );
              }
            }
          });
        }
      } else {
      }
    });
  }

  function updateFavoriteButtonUI(
    favoriteBtn,
    favoriteIcon,
    favoriteText,
    isFavorited
  ) {
    if (isFavorited) {
      favoriteIcon.className = "fas fa-heart text-red-500";
      favoriteText.textContent = "Remove from Favorites";
    } else {
      favoriteIcon.className = "far fa-heart text-gray-400";
      favoriteText.textContent = "Add to Favorites";
    }
  }

  window.updateFavoriteButtonUI = updateFavoriteButtonUI;

  async function fetchFavoriteCount(bookId) {
    try {
      const response = await fetch(
        `/book-Library/actions/get_book_favorite_count.php?book_id=${bookId}`
      );
      const data = await response.json();

      if (data.success) {
        const favoriteCountElement =
          document.getElementById("bookFavoriteCount");
        const count = data.favorite_count;

        if (count === 0) {
          favoriteCountElement.textContent =
            "This book hasn't been favorited yet";
        } else if (count === 1) {
          favoriteCountElement.textContent =
            "This book is a favorite to 1 user";
        } else {
          favoriteCountElement.textContent = `This book is a favorite to ${count} users`;
        }

        favoriteCountElement.style.display = "flex";
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
      document.getElementById("bookFavoriteCount").style.display = "none";
    }
  }

  function getBookIdForReview(book) {
    if (book.id) {
      return book.id;
    }

    if (book.title) {
      const foundBook = books.find((b) => b.title === book.title);
      if (foundBook && foundBook.id) {
        return foundBook.id;
      }
    }

    console.warn("Could not find book ID for:", book);
    return null;
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
          avgRatingValue.textContent = "-.-";
          totalRatings.textContent = "(0 ratings)";
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
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
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
    avgRatingValue.innerHTML = getStarHTML(average, false);
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

  function setupReviewSystem(book) {
    const submitReviewBtn = document.getElementById("submitReviewBtn");
    const reviewComment = document.getElementById("reviewComment");

    let currentReviewRating = 0;

    const starButtons = document.querySelectorAll(".star-btn");
    const originalClickHandlers = [];
    starButtons.forEach((btn, index) => {
      originalClickHandlers[index] = btn.onclick;

      btn.addEventListener("click", (e) => {
        if (book.cover_image) {
          currentReviewRating = index + 1;
          highlightStars(currentReviewRating);
          e.stopPropagation(); // Prevent triggering the main rating system
        }
      });

      btn.addEventListener("mouseenter", () => {
        if (book.cover_image) {
          highlightStars(index + 1);
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (book.cover_image) {
          highlightStars(currentReviewRating);
        }
      });
    });

    submitReviewBtn.addEventListener("click", () => {
      const comment = reviewComment.value.trim();

      if (!comment) {
        showReviewMessage("Please write a review comment", "error");
        return;
      }

      if (currentReviewRating === 0) {
        showReviewMessage("Please select a rating", "error");
        return;
      }

      submitReview(book, currentReviewRating, comment);
    });
  }

  function submitReview(book, rating, comment) {
    const bookId = getBookIdForReview(book);

    if (!bookId) {
      showReviewMessage(
        "Could not identify book for review. Please try refreshing the page.",
        "error"
      );
      console.error("Book object for review:", book);
      return;
    }

    const reviewData = {
      book_id: bookId,
      rating: rating,
      comment: comment,
      csrf_token: getCSRFToken(),
    };

    fetch("/book-Library/actions/submit_review.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    })
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          showReviewMessage(data.message, "success");
          document.getElementById("reviewComment").value = "";
          // Reload reviews to show the new one
          loadBookReviews(bookId);
        } else {
          showReviewMessage(data.error || "Failed to submit review", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting review:", err);
        showReviewMessage("Error submitting review", "error");
      });
  }

  function loadBookReviews(bookId) {
    if (!bookId) return;

    fetch(`/book-Library/actions/get_reviews.php?book_id=${bookId}`)
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          displayReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
      });
  }

  function displayReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");

    if (reviews.length === 0) {
      reviewsList.innerHTML =
        '<p class="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to review this book!</p>';
      return;
    }

    const latestReview = reviews[0]; 
    let reviewsHTML = `
      <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400">
              ${getStarHTML(latestReview.rating, false)}
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">${
              latestReview.user_name
            }</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
            latestReview.created_at
          ).toLocaleDateString()}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${
          latestReview.comment
        }</p>
      </div>
    `;

    if (reviews.length > 1) {
      reviewsHTML += `
        <div class="text-center">
          <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Read ${reviews.length - 1} more review${
        reviews.length > 2 ? "s" : ""
      }
          </button>
        </div>
      `;
    }

    reviewsList.innerHTML = reviewsHTML;

    const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");
    if (showAllReviewsBtn) {
      showAllReviewsBtn.addEventListener("click", () => {
        showAllReviews(reviews);
      });
    }
  }

  function showAllReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");

    if (showAllReviewsBtn) {
      showAllReviewsBtn.classList.add("loading");
      showAllReviewsBtn.textContent = "Loading...";
    }

    const currentContent = reviewsList.querySelector(".review-item");
    if (currentContent) {
      currentContent.classList.remove("show");
      currentContent.classList.add("hide");
    }

    setTimeout(() => {
      let allReviewsHTML = "";

      reviews.forEach((review, index) => {
        allReviewsHTML += `
          <div class="review-item ${
            index === 0 ? "show" : ""
          } bg-gray-50 dark:bg-gray-700 rounded-lg p-3 ${
          index > 0 ? "mt-3" : ""
        }">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="flex text-yellow-400">
                  ${getStarHTML(review.rating, false)}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${
                  review.user_name
                }</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
                review.created_at
              ).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">${
              review.comment
            }</p>
          </div>
        `;
      });

      allReviewsHTML += `
        <div class="text-center mt-3">
          <button id="showLessReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Show Less
          </button>
        </div>
      `;

      reviewsList.innerHTML = allReviewsHTML;

      const reviewItems = reviewsList.querySelectorAll(".review-item");
      reviewItems.forEach((item, index) => {
        if (index > 0) {
          setTimeout(() => {
            item.classList.add("show");
          }, index * 100); // Stagger the animation
        }
      });

      const showLessReviewsBtn = document.getElementById("showLessReviewsBtn");
      if (showLessReviewsBtn) {
        showLessReviewsBtn.addEventListener("click", () => {
          showLessReviews(reviews); 
        });
      }
    }, 200); 
  }

  function showLessReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    const showLessReviewsBtn = document.getElementById("showLessReviewsBtn");

    if (showLessReviewsBtn) {
      showLessReviewsBtn.classList.add("loading");
      showLessReviewsBtn.textContent = "Loading...";
    }

    const reviewItems = reviewsList.querySelectorAll(".review-item");
    reviewItems.forEach((item, index) => {
      if (index > 0) {
        item.classList.remove("show");
        item.classList.add("hide");
      }
    });

    setTimeout(() => {
      const latestReview = reviews[0];

      let reviewsHTML = `
        <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="flex text-yellow-400">
                ${getStarHTML(latestReview.rating, false)}
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">${
                latestReview.user_name
              }</span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
              latestReview.created_at
            ).toLocaleDateString()}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">${
            latestReview.comment
          }</p>
        </div>
      `;

      if (reviews.length > 1) {
        reviewsHTML += `
          <div class="text-center">
            <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
              Read ${reviews.length - 1} more review${
          reviews.length > 2 ? "s" : ""
        }
            </button>
          </div>
        `;
      }

      reviewsList.innerHTML = reviewsHTML;

      const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");
      if (showAllReviewsBtn) {
        showAllReviewsBtn.addEventListener("click", () => {
          showAllReviews(reviews);
        });
      }
    }, 200); 
  }

  function showReviewMessage(message, type) {
    const reviewMessage = document.getElementById("reviewMessage");
    reviewMessage.textContent = message;
    reviewMessage.className = `text-sm mt-2 ${
      type === "success" ? "text-green-600" : "text-red-600"
    }`;

    setTimeout(() => {
      reviewMessage.textContent = "";
      reviewMessage.className = "text-sm mt-2";
    }, 3000);
  }

  function resetReviewForm() {
    const reviewComment = document.getElementById("reviewComment");
    if (reviewComment) {
      reviewComment.value = "";
    }

    const reviewMessage = document.getElementById("reviewMessage");
    if (reviewMessage) {
      reviewMessage.textContent = "";
      reviewMessage.className = "text-sm mt-2";
    }

    if (
      document.getElementById("reviewSection") &&
      !document.getElementById("reviewSection").classList.contains("hidden")
    ) {
      const starButtons = document.querySelectorAll(".star-btn");
      starButtons.forEach((btn) => {
        btn.classList.remove("text-yellow-400");
        btn.classList.add("text-gray-300");
      });
    }
  }

  function loadDatabaseBookRating(bookId) {
    fetch(
      `/book-Library/actions/get_database_book_rating.php?book_id=${bookId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateDatabaseBookRating(data);
        }
      })
      .catch((err) => {
        console.error("Error loading database book rating:", err);
      });
  }

  function updateDatabaseBookRating(data) {
    const avgRatingValue = document.getElementById("avgRatingValue");
    const totalRatings = document.getElementById("totalRatings");
    const avgRatingStars = document.getElementById("avgRatingStars");
    const ratingLabel = document.getElementById("ratingLabel");

    if (!data.total_ratings || data.average_rating === 0) {
      avgRatingValue.textContent = "0.0";
      totalRatings.textContent = "(0 ratings)";
      avgRatingStars.innerHTML = getStarHTML(0, false);
      ratingLabel.textContent = "Rate this book:";
    } else {
      avgRatingValue.textContent = data.average_rating;
      totalRatings.textContent = `(${data.total_ratings} ratings)`;
      avgRatingStars.innerHTML = getStarHTML(data.average_rating, false);

      if (data.user_rating) {
        ratingLabel.textContent = "Your Rating for this book:";
      } else {
        ratingLabel.textContent = "Rate this book:";
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
      rating: rating,
      csrf_token: getCSRFToken(),
    };

    fetch("/book-Library/actions/rate_database_book.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    })
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          setUserRating(rating);
          updateDatabaseBookRating(data);
          showRatingMessage("Rating saved successfully!", "success");

          const ratingLabel = document.getElementById("ratingLabel");
          ratingLabel.textContent = "Your Rating for this book:";
        } else {
          showRatingMessage(data.error || "Failed to save rating", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting database book rating:", err);
        showRatingMessage("Error saving rating", "error");
      });
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
          avgRatingValue.textContent = "-.-";
          totalRatings.textContent = "(0 ratings)";
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
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
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

  function setupReviewSystem(book) {
    const submitReviewBtn = document.getElementById("submitReviewBtn");
    const reviewComment = document.getElementById("reviewComment");

    let currentReviewRating = 0;

    const starButtons = document.querySelectorAll(".star-btn");

    const originalClickHandlers = [];
    starButtons.forEach((btn, index) => {
      originalClickHandlers[index] = btn.onclick;

      btn.addEventListener("click", (e) => {
        if (book.cover_image) {
          currentReviewRating = index + 1;
          highlightStars(currentReviewRating);
          e.stopPropagation(); 
        }
      });

      btn.addEventListener("mouseenter", () => {
        if (book.cover_image) {
          highlightStars(index + 1);
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (book.cover_image) {
          highlightStars(currentReviewRating);
        }
      });
    });

    submitReviewBtn.addEventListener("click", () => {
      const comment = reviewComment.value.trim();

      if (!comment) {
        showReviewMessage("Please write a review comment", "error");
        return;
      }

      if (currentReviewRating === 0) {
        showReviewMessage("Please select a rating", "error");
        return;
      }

      submitReview(book, currentReviewRating, comment);
    });
  }

  function submitReview(book, rating, comment) {
    const bookId = getBookIdForReview(book);

    if (!bookId) {
      showReviewMessage(
        "Could not identify book for review. Please try refreshing the page.",
        "error"
      );
      console.error("Book object for review:", book);
      return;
    }

    const reviewData = {
      book_id: bookId,
      rating: rating,
      comment: comment,
      csrf_token: getCSRFToken(),
    };

    fetch("/book-Library/actions/submit_review.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    })
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          showReviewMessage(data.message, "success");
          document.getElementById("reviewComment").value = "";
          // Reload reviews to show the new one
          loadBookReviews(bookId);
        } else {
          showReviewMessage(data.error || "Failed to submit review", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting review:", err);
        showReviewMessage("Error submitting review", "error");
      });
  }

  function loadBookReviews(bookId) {
    if (!bookId) return;

    fetch(`/book-Library/actions/get_reviews.php?book_id=${bookId}`)
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          displayReviews(data.reviews);
        }
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
      });
  }

  function displayReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");

    if (reviews.length === 0) {
      reviewsList.innerHTML =
        '<p class="text-gray-500 dark:text-gray-400 text-sm pb-3">No reviews yet. Be the first to review this book!</p>';
      return;
    }

    const latestReview = reviews[0]; 

    let reviewsHTML = `
      <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400">
              ${getStarHTML(latestReview.rating, false)}
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">${
              latestReview.user_name
            }</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
            latestReview.created_at
          ).toLocaleDateString()}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">${
          latestReview.comment
        }</p>
      </div>
    `;

    if (reviews.length > 1) {
      reviewsHTML += `
        <div class="text-center">
          <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Read ${reviews.length - 1} more review${
        reviews.length > 2 ? "s" : ""
      }
          </button>
        </div>
      `;
    }

    reviewsList.innerHTML = reviewsHTML;

    const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");
    if (showAllReviewsBtn) {
      showAllReviewsBtn.addEventListener("click", () => {
        showAllReviews(reviews);
      });
    }
  }

  function showAllReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");

    if (showAllReviewsBtn) {
      showAllReviewsBtn.classList.add("loading");
      showAllReviewsBtn.textContent = "Loading...";
    }

    const currentContent = reviewsList.querySelector(".review-item");
    if (currentContent) {
      currentContent.classList.remove("show");
      currentContent.classList.add("hide");
    }

    setTimeout(() => {
      let allReviewsHTML = "";

      reviews.forEach((review, index) => {
        allReviewsHTML += `
          <div class="review-item ${
            index === 0 ? "show" : ""
          } bg-gray-50 dark:bg-gray-700 rounded-lg p-3 ${
          index > 0 ? "mt-3" : ""
        }">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="flex text-yellow-400">
                  ${getStarHTML(review.rating, false)}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">${
                  review.user_name
                }</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
                review.created_at
              ).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">${
              review.comment
            }</p>
          </div>
        `;
      });

      allReviewsHTML += `
        <div class="text-center mt-3">
          <button id="showLessReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Show Less
          </button>
        </div>
      `;

      reviewsList.innerHTML = allReviewsHTML;

      const reviewItems = reviewsList.querySelectorAll(".review-item");
      reviewItems.forEach((item, index) => {
        if (index > 0) {
          setTimeout(() => {
            item.classList.add("show");
          }, index * 100); 
        }
      });

      const showLessReviewsBtn = document.getElementById("showLessReviewsBtn");
      if (showLessReviewsBtn) {
        showLessReviewsBtn.addEventListener("click", () => {
          showLessReviews(reviews); 
        });
      }
    }, 200); 
  }

  function showLessReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    const showLessReviewsBtn = document.getElementById("showLessReviewsBtn");

    if (showLessReviewsBtn) {
      showLessReviewsBtn.classList.add("loading");
      showLessReviewsBtn.textContent = "Loading...";
    }

    const reviewItems = reviewsList.querySelectorAll(".review-item");
    reviewItems.forEach((item, index) => {
      if (index > 0) {
        item.classList.remove("show");
        item.classList.add("hide");
      }
    });

    setTimeout(() => {
      const latestReview = reviews[0];

      let reviewsHTML = `
        <div class="review-item show bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="flex text-yellow-400">
                ${getStarHTML(latestReview.rating, false)}
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">${
                latestReview.user_name
              }</span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(
              latestReview.created_at
            ).toLocaleDateString()}</span>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">${
            latestReview.comment
          }</p>
        </div>
      `;

      if (reviews.length > 1) {
        reviewsHTML += `
          <div class="text-center">
            <button id="showAllReviewsBtn" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
              Read ${reviews.length - 1} more review${
          reviews.length > 2 ? "s" : ""
        }
            </button>
          </div>
        `;
      }

      reviewsList.innerHTML = reviewsHTML;

      const showAllReviewsBtn = document.getElementById("showAllReviewsBtn");
      if (showAllReviewsBtn) {
        showAllReviewsBtn.addEventListener("click", () => {
          showAllReviews(reviews);
        });
      }
    }, 200); 
  }

  function getBookIdFromTitle(title) {
    const book = books.find((b) => b.title === title);
    return book ? book.id : null;
  }

  function getBookIdForReview(book) {
    if (book.id) {
      return book.id;
    }

    if (book.title) {
      const foundBook = books.find((b) => b.title === book.title);
      if (foundBook && foundBook.id) {
        return foundBook.id;
      }
    }

    console.warn("Could not find book ID for:", book);
    return null;
  }

  function showReviewMessage(message, type) {
    const reviewMessage = document.getElementById("reviewMessage");
    reviewMessage.textContent = message;
    reviewMessage.className = `text-sm mt-2 ${
      type === "success" ? "text-green-600" : "text-red-600"
    }`;

    setTimeout(() => {
      reviewMessage.textContent = "";
      reviewMessage.className = "text-sm mt-2";
    }, 3000);
  }

  function resetReviewForm() {
    const reviewComment = document.getElementById("reviewComment");
    if (reviewComment) {
      reviewComment.value = "";
    }

    const reviewMessage = document.getElementById("reviewMessage");
    if (reviewMessage) {
      reviewMessage.textContent = "";
      reviewMessage.className = "text-sm mt-2";
    }

    if (
      document.getElementById("reviewSection").classList.contains("hidden") ===
      false
    ) {
      const starButtons = document.querySelectorAll(".star-btn");
      starButtons.forEach((btn) => {
        btn.classList.remove("text-yellow-400");
        btn.classList.add("text-gray-300");
      });
    }
  }

  function loadDatabaseBookRating(bookId) {
    fetch(
      `/book-Library/actions/get_database_book_rating.php?book_id=${bookId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateDatabaseBookRating(data);
        }
      })
      .catch((err) => {
        console.error("Error loading database book rating:", err);
      });
  }

  function updateDatabaseBookRating(data) {
    const avgRatingValue = document.getElementById("avgRatingValue");
    const totalRatings = document.getElementById("totalRatings");
    const avgRatingStars = document.getElementById("avgRatingStars");
    const ratingLabel = document.getElementById("ratingLabel");

    if (!data.total_ratings || data.average_rating === 0) {
      avgRatingValue.textContent = "0.0";
      totalRatings.textContent = "(0 ratings)";
      avgRatingStars.innerHTML = getStarHTML(0, false);
      ratingLabel.textContent = "Rate this book:";
    } else {
      avgRatingValue.textContent = data.average_rating;
      totalRatings.textContent = `(${data.total_ratings} ratings)`;
      avgRatingStars.innerHTML = getStarHTML(data.average_rating, false);

      if (data.user_rating) {
        ratingLabel.textContent = "Your Rating for this book:";
      } else {
        ratingLabel.textContent = "Rate this book:";
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
      rating: rating,
      csrf_token: getCSRFToken(),
    };

    fetch("/book-Library/actions/rate_database_book.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ratingData),
    })
      .then(async (response) => {
        const data = await handleAjaxResponse(response);
        if (!data) return; // Session timeout handled by helper
        
        if (data.success) {
          setUserRating(rating);
          updateDatabaseBookRating(data);
          showRatingMessage("Rating saved successfully!", "success");

          const ratingLabel = document.getElementById("ratingLabel");
          ratingLabel.textContent = "Your Rating for this book:";
        } else {
          showRatingMessage(data.error || "Failed to save rating", "error");
        }
      })
      .catch((err) => {
        console.error("Error submitting database book rating:", err);
        showRatingMessage("Error saving rating", "error");
      });
  }

  function setupPrivateComments(book) {
    const privateCommentForm = document.getElementById("privateCommentForm");
    const privateCommentLoginPrompt = document.getElementById(
      "privateCommentLoginPrompt"
    );
    const existingComment = document.getElementById("existingComment");
    const privateCommentText = document.getElementById("privateCommentText");
    const charCount = document.getElementById("charCount");
    const submitPrivateCommentBtn = document.getElementById(
      "submitPrivateCommentBtn"
    );
    const editCommentBtn = document.getElementById("editCommentBtn");

    if (typeof userIsLoggedIn !== "undefined" && userIsLoggedIn) {
      if (privateCommentForm) privateCommentForm.style.display = "block";
      if (privateCommentLoginPrompt)
        privateCommentLoginPrompt.style.display = "none";

      if (book.cover_image) {
        loadExistingComment(book.id);
      }
    } else {
      if (privateCommentForm) privateCommentForm.style.display = "none";
      if (privateCommentLoginPrompt)
        privateCommentLoginPrompt.style.display = "block";
      if (existingComment) existingComment.style.display = "none";
    }

    if (privateCommentText) {
      privateCommentText.addEventListener("input", function () {
        const count = this.value.length;
        if (charCount) charCount.textContent = `${count}/1000`;

        const favoriteAutoAddMessage = document.getElementById(
          "favoriteAutoAddMessage"
        );
        if (favoriteAutoAddMessage) {
          if (count > 0) {
            favoriteAutoAddMessage.classList.remove("hidden");
          } else {
            favoriteAutoAddMessage.classList.add("hidden");
          }
        }

        if (submitPrivateCommentBtn) {
          submitPrivateCommentBtn.disabled = count > 1000;
        }
      });
    }

    if (submitPrivateCommentBtn) {
      submitPrivateCommentBtn.addEventListener("click", function () {
        submitPrivateComment(book);
      });
    }

    if (editCommentBtn) {
      editCommentBtn.addEventListener("click", function () {
        editExistingComment();
      });
    }
  }

  async function loadExistingComment(bookId) {
    try {
      const response = await fetch(
        `/book-Library/actions/get_user_comment.php?book_id=${bookId}`
      );
      const data = await response.json();

      if (data.success && data.comment) {
        showExistingComment(data.comment);
      } else {
        hideExistingComment();
      }
    } catch (error) {
      console.error("Error loading existing comment:", error);
      hideExistingComment();
    }
  }

  function showExistingComment(comment) {
    const privateCommentForm = document.getElementById("privateCommentForm");
    const existingComment = document.getElementById("existingComment");
    const commentText = document.getElementById("commentText");
    const commentDate = document.getElementById("commentDate");

    if (privateCommentForm) privateCommentForm.style.display = "none";
    if (existingComment) existingComment.style.display = "block";
    if (commentText) commentText.textContent = comment.comment;
    if (commentDate)
      commentDate.textContent = `Added on ${new Date(
        comment.created_at
      ).toLocaleDateString()}`;
  }

  function hideExistingComment() {
    const privateCommentForm = document.getElementById("privateCommentForm");
    const existingComment = document.getElementById("existingComment");
    const favoriteAutoAddMessage = document.getElementById(
      "favoriteAutoAddMessage"
    );

    if (privateCommentForm) privateCommentForm.style.display = "block";
    if (existingComment) existingComment.style.display = "none";
    if (favoriteAutoAddMessage) favoriteAutoAddMessage.classList.add("hidden");
  }

  function editExistingComment() {
    const privateCommentForm = document.getElementById("privateCommentForm");
    const existingComment = document.getElementById("existingComment");
    const privateCommentText = document.getElementById("privateCommentText");
    const commentText = document.getElementById("commentText");
    const favoriteAutoAddMessage = document.getElementById(
      "favoriteAutoAddMessage"
    );

    if (privateCommentForm) privateCommentForm.style.display = "block";
    if (existingComment) existingComment.style.display = "none";
    if (privateCommentText && commentText)
      privateCommentText.value = commentText.textContent;

    if (
      favoriteAutoAddMessage &&
      privateCommentText &&
      privateCommentText.value.length > 0
    ) {
      favoriteAutoAddMessage.classList.remove("hidden");
    }
  }

  async function submitPrivateComment(book) {
    const privateCommentText = document.getElementById("privateCommentText");
    const submitPrivateCommentBtn = document.getElementById(
      "submitPrivateCommentBtn"
    );
    const privateCommentMessage = document.getElementById(
      "privateCommentMessage"
    );

    if (
      !privateCommentText ||
      !submitPrivateCommentBtn ||
      !privateCommentMessage
    )
      return;

    const comment = privateCommentText.value.trim();

    if (!comment) {
      showPrivateCommentMessage("Please enter a comment", "error");
      return;
    }

    if (comment.length > 1000) {
      showPrivateCommentMessage(
        "Comment is too long (max 1000 characters)",
        "error"
      );
      return;
    }

    submitPrivateCommentBtn.disabled = true;
    submitPrivateCommentBtn.textContent = "Saving...";

    try {
      const response = await fetch(
        "/book-Library/actions/add_private_comment.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            book_id: book.id,
            comment: comment,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        let message = data.message || "Comment saved successfully!";
        if (data.favorite_added) {
          message += " Book has been added to your favorites.";
        }

        showPrivateCommentMessage(message, "success");
        privateCommentText.value = "";
        if (charCount) charCount.textContent = "0/1000";

        showExistingComment(data.comment);

        if (data.favorite_added) {
          updateModalFavoriteButton(book.id, true);

          if (window.ensureFavoritesLoaded) {
            window.ensureFavoritesLoaded();
          }
        }
      } else {
        showPrivateCommentMessage(
          data.error || "Failed to save comment",
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      showPrivateCommentMessage("Error saving comment", "error");
    } finally {
      submitPrivateCommentBtn.disabled = false;
      submitPrivateCommentBtn.textContent = "Save Note";
    }
  }

  function showPrivateCommentMessage(message, type) {
    const privateCommentMessage = document.getElementById(
      "privateCommentMessage"
    );
    if (!privateCommentMessage) return;

    privateCommentMessage.textContent = message;
    privateCommentMessage.className = `text-sm mt-2 ${
      type === "success" ? "text-green-600" : "text-red-600"
    }`;

    setTimeout(() => {
      privateCommentMessage.textContent = "";
      privateCommentMessage.className = "text-sm mt-2";
    }, 5000);
  }

  function updateModalFavoriteButton(bookId, isFavorited) {
    const favoriteBtn = document.getElementById("favoriteBtn");
    if (!favoriteBtn) return;

    const favoriteIcon = favoriteBtn.querySelector("i");
    const favoriteText = favoriteBtn.querySelector(".favorite-text");

    if (favoriteIcon && favoriteText) {
      favoriteBtn.dataset.favorited = isFavorited.toString();

      updateFavoriteButtonUI(
        favoriteBtn,
        favoriteIcon,
        favoriteText,
        isFavorited
      );

      const cardButtons = document.querySelectorAll(
        `[data-book-id="${bookId}"].favorite-btn`
      );
      cardButtons.forEach((btn) => {
        btn.dataset.favorited = isFavorited.toString();
        const icon = btn.querySelector("i");
        if (icon) {
          icon.className = isFavorited
            ? "fas fa-heart text-red-500"
            : "far fa-heart text-gray-400";
        }

        if (
          btn.classList.contains("absolute") &&
          btn.classList.contains("top-2")
        ) {
          if (isFavorited) {
            btn.classList.add(
              "bg-red-50",
              "border-red-300",
              "dark:bg-red-900/20",
              "dark:border-red-600"
            );
            btn.classList.remove("hover:bg-red-50", "dark:hover:bg-red-900/20");
          } else {
            btn.classList.remove(
              "bg-red-50",
              "border-red-300",
              "dark:bg-red-900/20",
              "dark:border-red-600"
            );
            btn.classList.add("hover:bg-red-50", "dark:hover:bg-red-900/20");
          }
        }
      });
    }
  }
});
