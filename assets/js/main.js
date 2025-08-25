// Dark mode functionality has been moved to dark-mode.js
// This file now only handles scroll-to-top, form focus, and flash message dismissal

document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.getElementById("scrollToTopBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      scrollBtn.classList.remove("opacity-0", "pointer-events-none");
      scrollBtn.classList.add("opacity-100", "pointer-events-auto");
    } else {
      scrollBtn.classList.add("opacity-0", "pointer-events-none");
      scrollBtn.classList.remove("opacity-100", "pointer-events-auto");
    }
  });

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const emailInput = document.getElementById("email");
  const nameInput = document.getElementById("name");
  
  if (emailInput && !nameInput) {
    emailInput.focus();
  }
  
  if (nameInput) {
    nameInput.focus();
  }
});

function dismissFlash() {
  const flash = document.getElementById("flash-message");
  if (flash) {
    flash.style.transition = "opacity 1s ease";
    flash.style.opacity = "0";

    setTimeout(() => {
      flash.remove();
    }, 1000);
  }
}

// auto-dismiss after 3 sec, then fade for 1 sec
setTimeout(dismissFlash, 3000);
