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
        // Optional: localStorage.removeItem("wishlist");
      } else {
        console.error("Wishlist sync failed:", data.error);
      }
    })
    .catch(error => console.error("Wishlist sync error:", error));
  }
}

function fetchWishlistFromDB() {
  return fetch("get_wishlist.php", {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        localStorage.setItem("wishlist", JSON.stringify(data));
        return data;
      } else {
        console.warn("get_wishlist.php returned unexpected data:", data);
        return [];
      }
    })
    .catch(error => {
      console.error("Failed to fetch wishlist from DB:", error);
      return [];
    });
}

async function initWishlist() {
  const wishlistSection = document.getElementById("wishlistSection");

  const loggedIn = await checkLoginStatus();
  let wishlist = [];

  if (loggedIn) {
    await syncWishlistToDB();
    wishlist = await fetchWishlistFromDB();
  } else {
    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  }

  if (!wishlist.length) {
    wishlistSection.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  wishlistSection.innerHTML = "";

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
  fetch("remove_from_wishlist.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `title=${encodeURIComponent(title)}`
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.warn("Warning: Failed to remove from DB:", data.message);
      }
    })
    .finally(() => {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      wishlist = wishlist.filter(item => item.title !== title);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      container.remove();

      if (wishlist.length === 0) {
        document.getElementById("wishlistSection").innerHTML = "<p>Your wishlist is empty.</p>";
      }
    });
}

document.addEventListener("DOMContentLoaded", initWishlist);
