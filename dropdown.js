const toggle = document.getElementById("dropdownToggle");
const menu = document.getElementById("dropdownMenu");
const arrow = document.getElementById("dropdownArrow");
const logoutBtn = document.getElementById("logoutBtn");

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

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();

  fetch("logout.php", {
    method: "GET",
    credentials: "include"
  })
    .then(() => {
      localStorage.clear(); 
      location.reload();
    })
    .catch(err => {
      console.error("Logout failed:", err);
    });
});