
function loadWishlistFromDB() {
  fetch("get_wishlist.php", {
    credentials: "include" // include session cookies
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        localStorage.setItem("wishlist", JSON.stringify(data));
        console.log("Wishlist loaded from DB into localStorage");

        // Optionally reload the page to reflect updated wishlist
        location.reload();
      } else {
        console.error("Invalid wishlist data from server");
      }
    })
    .catch(error => {
      console.error("Error loading wishlist from DB:", error);
    });
}

checkLoginStatus().then(loggedIn => {
  if (loggedIn) {
    loadWishlistFromDB();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const wishlistSection = document.getElementById("wishlistSection");

  // Check if user is logged in
  fetch('check_login.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        loadFromLocalStorage(); // fallback
      } else {
        syncWishlistToDB().then(fetchWishlistFromDB);
      }
    })
    .catch(() => {
      loadFromLocalStorage(); // if error in login check
    });

  function syncWishlistToDB() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (wishlist.length === 0) return Promise.resolve();

    return fetch("sync_wishlist.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ wishlist })
    }).then(res => res.json())
      .then(data => {
        if (!data.success) console.warn("Wishlist sync failed:", data.error);
      });
  }

  function fetchWishlistFromDB() {
    fetch("get_wishlist.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          wishlistSection.innerHTML = "<p>Failed to load wishlist.</p>";
          return;
        }
        updateWishlistUI(data);
        localStorage.setItem("wishlist", JSON.stringify(data)); // Optional
      })
      .catch(() => {
        wishlistSection.innerHTML = "<p>Failed to load wishlist from server.</p>";
      });
  }

  function loadFromLocalStorage() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    updateWishlistUI(wishlist);
  }

  function updateWishlistUI(wishlist) {
    wishlistSection.innerHTML = "";

    if (wishlist.length === 0) {
      wishlistSection.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }

    wishlist.forEach(product => {
      const container = document.createElement("div");
      container.classList = "productContainer";

      const imageCont = document.createElement("div");
      imageCont.classList = "imageCont";
      const cartDescription = document.createElement("div");
      cartDescription.classList = "cartDescription";

      const img = document.createElement("img");
      img.src = product.img;
      img.alt = product.title;
      img.classList = "imgP";

      const title = document.createElement("p");
      title.textContent = product.title;
      title.classList = "titleP";

      const price = document.createElement("p");
      price.textContent = `₱${parseFloat(product.price).toFixed(2)}`;
      price.classList = "priceP";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList = "remove-btn";
      removeBtn.addEventListener("click", () => {
        removeFromWishlistByTitle(product.title, container);
      });

      imageCont.appendChild(img);
      container.appendChild(imageCont);
      cartDescription.appendChild(title);
      cartDescription.appendChild(price);
      container.appendChild(cartDescription);
      container.appendChild(removeBtn);

      wishlistSection.appendChild(container);
    });
  }

  function removeFromWishlistByTitle(title, container) {
    fetch('remove_from_wishlist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: `title=${encodeURIComponent(title)}`
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) console.warn("Failed to remove:", data.message);
      })
      .finally(() => {
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        wishlist = wishlist.filter(item => item.title !== title);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        container.remove();

        if (wishlist.length === 0) {
          wishlistSection.innerHTML = "<p>Your wishlist is empty.</p>";
        }
      });
  }
});



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