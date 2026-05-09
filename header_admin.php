<header>
    <input type="checkbox" name="" id="toggler">
    <label for="toggler" class="fas fa-bars"></label>
    <a href="#" class="logo"><img src="temp casaLogo.png"><span></span></a>

    <nav class="nav-bar">
        <div class="dropdown" id="profileDropdown">
            <div id="dropdownToggle">
                <i class="fas fa-user-circle"></i>
                <i class="fas fa-chevron-down" id="dropdownArrow"></i>
            </div>

            <div class="dropdown-menu" id="dropdownMenu">
                <a href="#" id="logoutBtn" style="color: black;">Log out</a>
            </div>
        </div>
    </nav>
</header>

<script>
const logoutBtn = document.getElementById("logoutBtn");

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
</script>