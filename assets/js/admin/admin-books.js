document.getElementById("addBookBtn").addEventListener("click", () => {
  document.getElementById("addBookModal").classList.remove("hidden");
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("addBookModal").classList.add("hidden");
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("addBookModal").classList.add("hidden");
});

document.getElementById("addBookModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("addBookModal")) {
    document.getElementById("addBookModal").classList.add("hidden");
  }
});

document.getElementById("searchBooks").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const bookCards = document.querySelectorAll(".book-card");

  bookCards.forEach((card) => {
    const title = card.querySelector("h4").textContent.toLowerCase();
    const author = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(searchTerm) || author.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// edit book modal 
document.getElementById("closeEditModal").addEventListener("click", () => {
  document.getElementById("editBookModal").classList.add("hidden");
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("editBookModal").classList.add("hidden");
});

document.getElementById("editBookModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("editBookModal")) {
    document.getElementById("editBookModal").classList.add("hidden");
  }
});

function editBook(id, title, author, description, publishedYear, pages, rating, categoryId, coverImage) {
  // populate the form with book data
  document.getElementById("edit_book_id").value = id;
  document.getElementById("edit_title").value = title;
  document.getElementById("edit_author").value = author;
  document.getElementById("edit_description").value = description;
  document.getElementById("edit_published_year").value = publishedYear || '';
  document.getElementById("edit_pages").value = pages || '';
  document.getElementById("edit_rating").value = rating || '0';
  document.getElementById("edit_category_id").value = categoryId;
  
  const currentImagePreview = document.getElementById("current_image_preview");
  const currentImage = document.getElementById("current_image");
  
  if (coverImage && coverImage !== '') {
    currentImage.src = `/book-Library/uploads/${coverImage}`;
    currentImagePreview.classList.remove("hidden");
  } else {
    currentImagePreview.classList.add("hidden");
  }
  
  document.getElementById("edit_cover_image").value = '';
  
  document.getElementById("editBookModal").classList.remove("hidden");
}

function deleteBook(bookId) {
  if (
    confirm(
      "This book will be deleted from the home page and will not be available to users.(you can still restore it anytime)"
    )
  ) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "../actions/admin/delete_book.php";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "id";
    input.value = bookId;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }
}
