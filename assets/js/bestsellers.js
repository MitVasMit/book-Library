document.addEventListener("DOMContentLoaded", () => {
  const bestsellerList = document.getElementById("bestseller-list");
  const bestsellerLoader = document.getElementById("bestseller-loader");

  // Check if required elements exist before proceeding
  if (!bestsellerList) {
    
    return;
  }

  // check if loader exists before using it
  if (bestsellerLoader) {
    bestsellerLoader.classList.remove("hidden");
  }
  if (bestsellerList) {
    bestsellerList.classList.add("hidden");
  }

  fetch("https://openlibrary.org/search.json?q=bestsellers&limit=9")
    .then((res) => res.json())
    .then((data) => {
      const books = data.docs;

      books.forEach((book) => {
        const cover = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : "/assets/images/no-cover.png";

        const slide = document.createElement("div");
        slide.className = "swiper-slide p-4";

        slide.innerHTML = `
          <div class="bg-white dark:bg-gray-700 rounded shadow p-4 flex flex-col items-center max-w-[180px] mx-auto cursor-pointer hover:scale-105 transition-transform duration-300 relative">
            <!-- Favorite Button for Logged In Users -->
            ${
              window.userIsLoggedIn
                ? `
              <button class="favorite-btn absolute top-2 left-2 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-md z-10 transition-colors duration-200" 
                      data-book-id="${book.key}" data-favorited="false">
                <i class="far fa-heart"></i>
              </button>
            `
                : ""
            }
            
            <!-- Bestseller Badge -->
            <div class="absolute top-2 right-2 bg-blue-400 text-white text-xs px-2 py-1 rounded-md font-bold shadow-md z-10">
              🔥
            </div>
            
            <div class="w-full h-[220px] p-2 bg-white dark:bg-gray-600 rounded flex items-center justify-center">
              <img src="${cover}" alt="${
          book.title
        }" class="max-h-full object-contain" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white text-center mt-3">${
              book.title
            }</h3>
            <p class="text-xs text-gray-600 dark:text-gray-300 text-center">${
              book.author_name?.[0] || "Unknown Author"
            }</p>
          </div>
`;

        // Safely append the slide if bestsellerList exists
        if (bestsellerList) {
          bestsellerList.appendChild(slide);
        } else {
  
          return;
        }

        const bookCard = slide.querySelector("div");
        bookCard.addEventListener("click", (e) => {
          // Don't open modal if clicking on favorite button
          if (e.target.closest(".favorite-btn")) {
            return;
          }

          const bookData = {
            title: book.title,
            authors: [{ name: book.author_name?.[0] || "Unknown Author" }],
            cover_id: book.cover_i,
            key: book.key || null,
          };

          if (typeof window.openBookModal === "function") {
            window.openBookModal(bookData);
          }
        });

        // Add favorite button functionality
        if (window.userIsLoggedIn) {
          const favoriteBtn = slide.querySelector(".favorite-btn");
          if (favoriteBtn) {
            favoriteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              const isFavorited = favoriteBtn.dataset.favorited === "true";
              const newState = await window.toggleFavorite(
                book.key,
                isFavorited
              );

              if (newState !== undefined) {
                favoriteBtn.dataset.favorited = newState.toString();
                const icon = favoriteBtn.querySelector("i");
                if (icon) {
                  icon.className = newState
                    ? "fas fa-heart text-red-500"
                    : "far fa-heart text-gray-400";
                }
              }
            });
          }
        }
      });

      if (bestsellerLoader) {
        bestsellerLoader.classList.add("hidden");
      }
      if (bestsellerList) {
        bestsellerList.classList.remove("hidden");
      }

      // Initialize favorite states after books are displayed
      if (window.userIsLoggedIn && window.initializeFavoriteStates) {
        setTimeout(() => {
          window.initializeFavoriteStates();
        }, 100);
      }

      // Safely initialize Swiper if the container exists
      const swiperContainer = document.querySelector(".bestseller-swiper");
      if (swiperContainer) {
        const swiper = new Swiper(".bestseller-swiper", {
          slidesPerView: 3,
          spaceBetween: 40,
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          breakpoints: {
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          },
          on: {
            init: function () {
      
            },
          },
        });
      } else {

      }
    })
    .catch((err) => {
      if (bestsellerLoader) {
        bestsellerLoader.classList.add("hidden");
      }
      if (bestsellerList) {
        bestsellerList.innerHTML = `<p class="text-red-600 mx-auto">Failed to load bestsellers.</p>`;
      }
      console.error("Error loading bestsellers:", err);
    });
});
