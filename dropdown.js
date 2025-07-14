const toggle = document.getElementById("dropdownToggle");
  const menu = document.getElementById("dropdownMenu");
  const arrow = document.getElementById("dropdownArrow");

  toggle.addEventListener("click", () => {
    const isVisible = menu.style.display === "block";
    menu.style.display = isVisible ? "none" : "block";
    toggle.classList.toggle("open", !isVisible);
  });

  window.addEventListener("click", (e) => {
    if (!document.getElementById("profileDropdown").contains(e.target)) {
      menu.style.display = "none";
      toggle.classList.remove("open");
    }
  });