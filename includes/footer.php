<!-- includes/footer.php -->
<footer class="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-6 mt-12">
  <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
    <div class="mb-4 md:mb-0 text-center md:text-left">
      <p class="text-sm">&copy; <?= date('D-M-Y') ?> Book Library. All rights reserved.</p>
    </div>

    <nav class="flex space-x-6 mb-4 md:mb-0">
      <a href="../public/index.php" class="hover:text-blue-600">Home</a>
      <a href="../public/about.php" class="hover:text-blue-600">About</a>
      <a href="../public/contact.php" class="hover:text-blue-600">Contact</a>
      <a href="../public/privacy.php" class="hover:text-blue-600">Privacy</a>
    </nav>

    <div class="flex space-x-4">
      <a href="#" aria-label="Twitter" class="hover:text-blue-500">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 4.557a9.86 9.86 0 01-2.828.775 4.94 4.94 0 002.165-2.724 9.88 9.88 0 01-3.127 1.196 4.927 4.927 0 00-8.39 4.49A13.978 13.978 0 011.671 3.149 4.922 4.922 0 003.195 9.72a4.902 4.902 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085 4.933 4.933 0 004.604 3.417A9.876 9.876 0 010 21.542a13.952 13.952 0 007.548 2.209c9.058 0 14.01-7.513 14.01-14.01 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z" />
        </svg>
      </a>
      <a href="#" aria-label="Facebook" class="hover:text-blue-700">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.406.593 24 1.325 24h11.49v-9.294H9.69v-3.622h3.124V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.098 2.794.142v3.24h-1.918c-1.504 0-1.796.716-1.796 1.765v2.313h3.59l-.467 3.622h-3.123V24h6.116C23.406 24 24 23.406 24 22.675V1.325C24 .593 23.406 0 22.675 0z" />
        </svg>
      </a>
      <a href="#" aria-label="Instagram" class="hover:text-pink-600">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.314.975.974 1.252 2.242 1.314 3.608.058 1.267.069 1.647.069 4.851s-.011 3.584-.069 4.85c-.062 1.366-.34 2.633-1.314 3.608-.974.975-2.241 1.252-3.608 1.314-1.266.058-1.646.069-4.85.069s-3.584-.011-4.851-.069c-1.366-.062-2.633-.34-3.608-1.314-.975-.974-1.252-2.241-1.314-3.608-.058-1.266-.069-1.646-.069-4.85s.011-3.584.069-4.851c.062-1.366.34-2.633 1.314-3.608C5.516 2.503 6.783 2.226 8.15 2.163 9.416 2.105 9.796 2.094 13 2.094m0-2.163C8.735 0 8.332.012 7.052.07 5.782.128 4.63.409 3.678 1.36 2.726 2.313 2.444 3.464 2.386 4.735.012 8.332 0 8.735 0 13s.012 4.668.07 5.948c.058 1.271.34 2.422 1.292 3.374.953.952 2.104 1.234 3.374 1.292 1.28.058 1.683.07 5.948.07s4.668-.012 5.948-.07c1.271-.058 2.422-.34 3.374-1.292.952-.952 1.234-2.104 1.292-3.374.058-1.28.07-1.683.07-5.948s-.012-4.668-.07-5.948c-.058-1.271-.34-2.422-1.292-3.374-.952-.952-2.103-1.234-3.374-1.292C16.668.012 16.265 0 12 0z" />
        </svg>
      </a>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"></script>
<script src="../assets/js/bestsellers.js" defer></script>
<script src="../assets/js/books.js"></script>
<script src="../assets/js/search.js"></script>
<script src="../assets/js/reset_password_spinner.js"></script>
<script src="../assets/js/admin/admin.js"></script>



</body>

</html>