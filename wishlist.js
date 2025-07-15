fetch('menu_api.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('API error');
      }
      return response.json();
    })

document.addEventListener("DOMContentLoaded", () => {
    const wishlistSection = document.getElementById("wishlistSection");
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

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
        price.textContent = `$${product.price.toFixed(2)}`;
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

    // --- Modal setup ---
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

            modalImg.src = product.img;
            modalTitle.textContent = product.title || "";
            modalPrice.textContent = `$${product.price.toFixed(2)}`;

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

    // Close modal
    modalClose.addEventListener("click", () => modal.classList.add("hidden"));
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
});

// --- Function to remove item ---
function removeFromWishlistByTitle(title, container) {
    fetch('remove_from_wishlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `title=${encodeURIComponent(title)}`
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                showPopup("Warning: Failed to remove item from server: " + data.message);
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