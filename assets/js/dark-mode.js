// Dark Mode Manager - Loaded early to prevent flash
(function () {
  "use strict";

  // Check dark mode preference immediately to prevent flash
  function initDarkMode() {
    // Check both localStorage and sessionStorage for the most reliable state
    const darkMode =
      localStorage.getItem("darkMode") || sessionStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Only set if not already set or if explicitly different
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const currentDarkClass =
      document.documentElement.classList.contains("dark");

    if (darkMode === "true" || (!darkMode && prefersDark)) {
      if (!currentDarkClass) {
        document.documentElement.classList.add("dark");
      }
      if (currentTheme !== "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } else {
      if (currentDarkClass) {
        document.documentElement.classList.remove("dark");
      }
      if (currentTheme !== "light") {
        document.documentElement.setAttribute("data-theme", "light");
      }
    }
  }

  // Initialize immediately
  initDarkMode();

  // Dark Mode Toggle Class
  class DarkModeManager {
    constructor() {
      this.init();
    }

    init() {
      this.bindDarkModeToggles();
      this.syncDarkModeState();

      // Also bind toggles when DOM changes (for dynamic content)
      this.setupDynamicBinding();

      // Retry binding after a delay to ensure all elements are available
      this.retryBinding();
    }

    retryBinding() {
      let retryCount = 0;
      const maxRetries = 5;

      const attemptBinding = () => {
        if (retryCount >= maxRetries) {
          console.log("Max retries reached for dark mode toggle binding");
          return;
        }

        // Check if all toggles are available
        const allToggles = [
          "darkToggle",
          "darkToggleDesktop",
          "darkToggleTablet",
          "darkToggleStandalone",
        ];

        const availableToggles = allToggles.filter((id) =>
          document.getElementById(id)
        );

        if (availableToggles.length < allToggles.length) {
          retryCount++;
          console.log(
            `Retry ${retryCount}: Some toggles not found, retrying in 200ms...`
          );
          setTimeout(attemptBinding, 200);
        } else {
          console.log("All dark mode toggles found, binding successful");
          this.bindDarkModeToggles();
        }
      };

      // Start the retry process
      setTimeout(attemptBinding, 100);
    }

    setupDynamicBinding() {
      // Use MutationObserver to watch for new toggle buttons being added
      const toggleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            // Check if any new toggle buttons were added
            const newToggles = mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const toggles = node.querySelectorAll('[id^="darkToggle"]');
                toggles.forEach((toggle) => {
                  if (toggle && !toggle.dataset.bound) {
                    toggle.addEventListener("click", () =>
                      this.toggleDarkMode()
                    );
                    toggle.dataset.bound = "true";
                  }
                });
              }
            });
          }
        });
      });

      // Observe the entire document for new toggle buttons
      toggleObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    bindDarkModeToggles() {
      // Get all dark toggle buttons
      const darkToggles = [
        document.getElementById("darkToggle"), // Mobile
        document.getElementById("darkToggleDesktop"), // Desktop
        document.getElementById("darkToggleTablet"), // Tablet
        document.getElementById("darkToggleStandalone"), // Standalone (all pages)
      ];

      // Add event listeners to all dark toggle buttons
      darkToggles.forEach((toggle) => {
        if (toggle) {
          try {
            // Remove existing listeners to prevent duplicates
            toggle.removeEventListener("click", this.toggleDarkMode);
            toggle.addEventListener("click", () => this.toggleDarkMode());
          } catch (error) {
            console.warn(`Error binding toggle ${toggle.id}:`, error);
          }
        }
      });

      // Log for debugging
      console.log("Dark mode toggles bound:", {
        mobile: !!document.getElementById("darkToggle"),
        desktop: !!document.getElementById("darkToggleDesktop"),
        tablet: !!document.getElementById("darkToggleTablet"),
        standalone: !!document.getElementById("darkToggleStandalone"),
      });
    }

    toggleDarkMode() {
      const html = document.documentElement;
      const isDark = html.classList.contains("dark");

      // Set flag to prevent mutation observer from interfering
      window.isUserToggling = true;

      if (isDark) {
        html.classList.remove("dark");
        html.setAttribute("data-theme", "light");
        localStorage.setItem("darkMode", "false");
        sessionStorage.setItem("darkMode", "false");
        this.updateDarkModeIcons("🌙");
      } else {
        html.classList.add("dark");
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("darkMode", "true");
        sessionStorage.setItem("darkMode", "true");
        this.updateDarkModeIcons("☀️");
      }

      // Clear flag after a short delay to allow the toggle to complete
      setTimeout(() => {
        window.isUserToggling = false;
      }, 100);
    }

    updateDarkModeIcons(icon) {
      // Update all dark toggle buttons with the new icon
      const darkToggles = [
        document.getElementById("darkToggle"),
        document.getElementById("darkToggleDesktop"),
        document.getElementById("darkToggleTablet"),
        document.getElementById("darkToggleStandalone"),
      ];

      darkToggles.forEach((toggle) => {
        if (toggle && toggle.textContent !== undefined) {
          try {
            toggle.textContent = icon;
          } catch (error) {
            console.warn(`Error updating icon for ${toggle.id}:`, error);
          }
        }
      });
    }

    syncDarkModeState() {
      // Sync the icon states with the current dark mode state
      // Don't change the actual dark mode, just update icons
      const html = document.documentElement;
      const isDark = html.classList.contains("dark");

      if (isDark) {
        this.updateDarkModeIcons("☀️");
      } else {
        this.updateDarkModeIcons("🌙");
      }
    }
  }

  // Initialize Dark Mode Manager when DOM is ready, but only once
  if (!window.darkModeManager) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (!window.darkModeManager) {
          window.darkModeManager = new DarkModeManager();
        }
      });
    } else {
      // Page is already loaded
      if (!window.darkModeManager) {
        window.darkModeManager = new DarkModeManager();
      }
    }
  } else {
  }

  // Make dark mode manager globally available
  window.DarkModeManager = DarkModeManager;

  // Add a global function to force dark mode state preservation
  window.forceDarkModeState = function () {
    const darkMode =
      localStorage.getItem("darkMode") || sessionStorage.getItem("darkMode");
    const html = document.documentElement;

    if (darkMode === "true") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else if (darkMode === "false") {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }
  };

  // Call force function on load to ensure state is preserved
  window.addEventListener("load", window.forceDarkModeState);

  // Also call on DOMContentLoaded as a backup
  document.addEventListener("DOMContentLoaded", () => {
    window.forceDarkModeState();
  });

  // Final fallback: ensure dark mode system is working
  window.addEventListener("load", () => {
    // Ensure dark mode manager exists
    if (!window.darkModeManager) {
      console.log("Creating DarkModeManager on page load...");
      window.darkModeManager = new DarkModeManager();
    }

    // Force state preservation
    window.forceDarkModeState();

    // Log current state for debugging
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    const theme = html.getAttribute("data-theme");
    console.log("Dark mode state:", {
      isDark,
      theme,
      localStorage: localStorage.getItem("darkMode"),
    });
  });

  // Add a mutation observer to watch for unauthorized dark mode changes
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "class" ||
          mutation.attributeName === "data-theme")
      ) {
        // Skip if this is a user-initiated toggle or our own restoration
        if (window.isUserToggling || window.darkModeRestoring) {
          return;
        }

        const darkMode =
          localStorage.getItem("darkMode") ||
          sessionStorage.getItem("darkMode");
        const html = document.documentElement;
        const currentDarkClass = html.classList.contains("dark");

        // Only restore if there's a clear mismatch and it wasn't our own script
        if (darkMode === "true" && !currentDarkClass) {
          // Check if this change was made by our script (avoid infinite loops)
          const target = mutation.target;
          if (target === html && !window.darkModeRestoring) {
            window.darkModeRestoring = true;
            html.classList.add("dark");
            html.setAttribute("data-theme", "dark");
            setTimeout(() => {
              window.darkModeRestoring = false;
            }, 100);
          }
        } else if (darkMode === "false" && currentDarkClass) {
          const target = mutation.target;
          if (target === html && !window.darkModeRestoring) {
            window.darkModeRestoring = true;
            html.classList.remove("dark");
            html.setAttribute("data-theme", "light");
            setTimeout(() => {
              window.darkModeRestoring = false;
            }, 100);
          }
        }
      }
    });
  });

  // Start observing the document element for changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  // Remove the periodic check as it's too aggressive
  // The mutation observer and event listeners should be sufficient
})();
