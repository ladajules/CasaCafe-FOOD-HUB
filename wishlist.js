async function syncWishlistFromDB() {
  try {
    const response = await fetch("get_wishlist.php", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch wishlist from DB");
    const data = await response.json();

    if (!Array.isArray(data)) return [];

    localStorage.setItem("wishlist", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error syncing wishlist from DB:", error);
    return [];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const wishlistSection = document.getElementById("wishlistSection");

  const wishlist = [
  {
    title: "Tocilog",
    price: 90,
    img: "https://casacafe.dcism.org/IMAGES/tocilog.jpg"
  }
];

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
    img.src = product.img.replace("http://", "https://");  // avoid mixed content error
    img.alt = product.title;
    img.classList = "imgP";

    const title = document.createElement("p");
    title.textContent = product.title;
    title.classList = "titleP";

    const price = document.createElement("p");
    price.textContent = `₱${Number(product.price).toFixed(2)}`;
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

      modalImg.src = product.img.replace("http://", "https://");
      modalTitle.textContent = product.title || "";
      modalPrice.textContent = `₱${Number(product.price).toFixed(2)}`;

      modal.classList.remove("hidden");

      currentModalProduct = {
        title: product.title,
        price: product.price,
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
        console.warn("Failed to remove from server:", data.message);
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
