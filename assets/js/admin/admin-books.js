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
