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

  //take random category
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];

  fetch(`https://openlibrary.org/subjects/${randomCategory}.json?limit=100`)
    .then((res) => res.json())
    .then((data) => {
      loader.classList.add("hidden");
      books = data.works || [];
      renderPage(currentPage);
      setupPagination();
    })
    .catch((err) => {
      loader.classList.add("hidden");
      bookList.innerHTML = `<p class="text-red-600">Error loading Books.</p>`;
      console.error(err);
    });

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
      const cover = book.cover_id
        ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
        : null;

      const item = document.createElement("div");
      item.className =
        "bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 mx-auto flex flex-col items-center w-full max-w-[160px] min-h-[320px] hover:scale-105 transition duration-300 ease-in-out cursor-pointer relative";

      item.addEventListener("click", () => {
        console.log("Regular book clicked:", book);
        window.openBookModal(book);
      });

      console.log("Book data:", book); // Debug: log book data
      const rating =
        book.rating_average ||
        book.rating ||
        book.ratings_average ||
        book.ratings?.average ||
        0;
      const ratingCount =
        book.rating_count || book.ratings_count || book.ratings?.count || 0;
      console.log("Rating:", rating, "Count:", ratingCount); // Debug: log rating data

      const ratingBadge = `
        <div class="absolute top-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-10" style="left: auto; right: 8px;">
          <span>★</span>
          <span>4.5</span>
        </div>
      `;

      if (cover) {
        item.innerHTML = `
      <div class="relative w-full">
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <img src="${cover}" alt="${book.title}" 
         class="w-[120px] h-[180px] object-contain mb-4 p-2 bg-white rounded shadow" />

          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.authors?.[0]?.name || "Unknown Author"
          }</p>
        </div>
      </div>
    `;
      } else {
        item.innerHTML = `
      <div class="relative w-full">
        ${ratingBadge}
        <div class="flex flex-col items-center">
          <div class="w-full max-w-[150px] h-[200px] flex items-center justify-center bg-gray-200 dark:bg-gray-600 mb-4 rounded text-gray-500 dark:text-gray-400 italic text-center px-2">
            No cover available from this book.
          </div>
          <h3 class="text-md font-semibold text-gray-900 dark:text-white text-center">${
            book.title
          }</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 text-center">${
            book.authors?.[0]?.name || "Unknown Author"
          }</p>
        </div>
      </div>
    `;
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
      book.authors?.[0]?.name || "Unknown Author"
    }`;
    document.getElementById("coverTitle").textContent = book.title;
    document.getElementById("coverAuthor").textContent =
      book.authors?.[0]?.name || "Unknown Author";

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
});
