document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("adminSidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebarTextItems = document.querySelectorAll(".sidebar-text");
  const sidebarTitle = document.getElementById("sidebarTitle");
  const navLinks = sidebar ? sidebar.querySelectorAll("nav a") : [];

  if (!sidebar) return;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }
  
  let isExpanded = true;
  const cookieValue = getCookie("sidebarExpanded");
  if (cookieValue !== null) {
    isExpanded = cookieValue === "true";
  } else if (localStorage.getItem("sidebarExpanded") !== null) {
    isExpanded = localStorage.getItem("sidebarExpanded") === "true";
  }

  function updateSidebar() {
    if (isExpanded) {
      sidebar.style.width = "16rem";
      sidebarTitle.style.visibility = "visible";
      sidebar.classList.remove("collapsed");

      sidebarTextItems.forEach((el) => {
        el.style.opacity = "1";
        el.style.visibility = "visible";
        el.style.transition = "opacity 0.3s ease";
      });

      toggleBtn.innerHTML = "&#8592;";
      toggleBtn.style.transform = "none";
    } else {
      sidebar.style.width = "5rem";
      sidebarTitle.style.visibility = "hidden";
      sidebar.classList.add("collapsed");

      sidebarTextItems.forEach((el) => {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.transition = "opacity 0.3s ease";
      });

      toggleBtn.innerHTML = "&#8594;";
      toggleBtn.style.transform = "none";
    }
    localStorage.setItem("sidebarExpanded", isExpanded);
    document.cookie =
      "sidebarExpanded=" + (isExpanded ? "true" : "false") + "; path=/";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;
      updateSidebar();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (!isExpanded) {
      }
    });
  });

  updateSidebar();
});
