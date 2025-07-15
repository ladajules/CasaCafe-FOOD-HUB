async function checkLoginStatus() {
  const res = await fetch("check_session.php", { credentials: "include" });
  const data = await res.json();
  return data.loggedIn === true;
}

function syncWishlistToDB() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (wishlist.length > 0) {
    fetch("sync_wishlist.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ wishlist })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("Wishlist synced to database");
      } else {
        console.error("Sync failed:", data.error);
      }
    })
    .catch(error => {
      console.error("Sync error:", error);
    });
  }
}

async function fetchWishlistFromDB() {
  try {
    const res = await fetch("get_wishlist.php", { credentials: "include" });
    const data = await res.json();
    localStorage.setItem("wishlist", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Failed to fetch wishlist from DB:", error);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const wishlistSection = document.getElementById("wishlistSection");
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  const loggedIn = await checkLoginStatus();
  if (loggedIn) {
    await syncWishlistToDB(); // local → DB
    wishlist = await fetchWishlistFromDB(); // DB → local (replaces)
  }

  if (wishlist.length === 0) {
    wishlistSection.innerHTML = "<div style='flex-direction: column; align-items: center;'><p>You currently have no favorites</p><a href='product.html' class='btn' id='shopBtn'>Shop Now</a></div>";
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
    const priceValue = typeof product.price === "number" ? product.price : parseFloat(product.price);
    price.textContent = `₱${priceValue.toFixed(2)}`;
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

  // Modal setup
  const modal = document.getElementById("productModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const modalClose = document.querySelector(".modal .close");
  let currentModalProduct = null;

  wishlistSection.querySelectorAll("img.imgP").forEach((img, index) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      const product = wishlist[index];
      const priceValue = typeof product.price === "number" ? product.price : parseFloat(product.price);

      modalImg.src = product.img;
      modalTitle.textContent = product.title || "";
      modalPrice.textContent = `₱${priceValue.toFixed(2)}`;

      modal.classList.remove("hidden");

      currentModalProduct = {
        title: product.title,
        price: priceValue,
        img: product.img
      };
    });
  });

  const modalCartBtn = document.getElementById("modalCartBtn");

  modalCartBtn.addEventListener("click", () => {
    if (!currentModalProduct) return;
    const encodedTitle = encodeURIComponent(currentModalProduct.title);
    window.location.href = `product.html?title=${encodedTitle}`;
  });

  modalClose.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

function removeFromWishlistByTitle(title, container) {
  fetch('remove_from_wishlist.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `title=${encodeURIComponent(title)}`
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.warn("Server failed to remove wishlist item: " + data.message);
      }
    })
    .finally(() => {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlist = wishlist.filter(item => item.title !== title);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      container.remove();

      if (wishlist.length === 0) {
        document.getElementById("wishlistSection").innerHTML = "<div style='flex-direction: column; align-items: center;'><p>You currently have no favorites</p><a href='product.html' class='btn' id='shopBtn'>Shop Now</a></div>";
      }
    });
}

// Dropdown toggle
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
