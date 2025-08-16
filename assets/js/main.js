const toggle = document.getElementById("darkToggle");

function setDarkMode(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark");
    toggle.textContent = "🌞";
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.documentElement.classList.remove("dark");
    toggle.textContent = "🌙";
    localStorage.setItem("darkMode", "disabled");
  }
}

// when DOM loaded, see if dark-mode enabled/disabled
const darkModeSetting = localStorage.getItem("darkMode");

if (darkModeSetting === "enabled") {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

if (toggle) {
  toggle.addEventListener("click", () => {
    const isDarkNow = document.documentElement.classList.contains("dark");
    setDarkMode(!isDarkNow);
  });
}

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
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(dismissFlash, 3000);
});
