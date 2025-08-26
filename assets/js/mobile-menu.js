// Mobile Menu Functionality
// This file handles the mobile hamburger menu for all users (including admins)

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuContent = document.getElementById('mobileMenuContent');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');

    // Open mobile menu
    function openMobileMenu() {
        if (mobileMenu && mobileMenuContent) {
            mobileMenu.classList.remove('hidden');
            // Add show class for smooth animation
            setTimeout(() => {
                mobileMenu.classList.add('show');
            }, 10);
        }
    }

    // Close mobile menu
    function closeMobileMenu() {
        if (mobileMenu && mobileMenuContent) {
            // Remove show class for smooth animation
            mobileMenu.classList.remove('show');
            
            // Hide the menu after animation
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    }

    // Make closeMobileMenu globally accessible for other scripts
    window.closeMobileMenu = closeMobileMenu;

    // Event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (closeMobileMenuBtn) {
        closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
    }

    // Close menu when clicking outside
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
            closeMobileMenu();
        }
    });
});
