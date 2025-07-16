document.addEventListener("DOMContentLoaded", () => {
  const wishlistSection = document.getElementById("wishlistSection");

  fetch('check_login.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        fetchWishlistFromDB(); // only pull from DB
      } else {
        loadFromLocalStorage(); // fallback if not logged in
      }
    })
    .catch(() => {
      loadFromLocalStorage(); // fallback if error
    });

  function fetchWishlistFromDB() {
    fetch("get_wishlist.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          wishlistSection.innerHTML = "<p>Failed to load wishlist.</p>";
          return;
        }
        localStorage.setItem("wishlist", JSON.stringify(data)); // overwrite localStorage
        updateWishlistUI(data);
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
      
      const addBtn           = document.createElement("button");
    addBtn.textContent     = "Add to Cart";
    addBtn.className       = "cartBtn";
    addBtn.addEventListener("click", () => {
      const selectedVariantId = variantSelect ? variantSelect.value : null;
      const selectedVariantText = getSelectedText(variantSelect);

      const product = {
        title: item.item_name,
        price: price.textContent.replace('₱', ''),
        img: item.item_image || 'fallback.png',
        variant: selectedVariantId,
        variantText: selectedVariantText,
      };


      fetch('add_to_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({
          product: product.title,
          quantity: 1,
          price: product.price,
          variant: product.variant || ''
        })
      })
      .then(response => response.text())
      .then(text => {
        if (text.includes('successfully')) {
          showPopup(`${product.title} ${product.variantText} added to cart`);
        } else {
          showPopup(`Failed to add to cart: ${text}`);
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        showPopup('Error adding to cart.');
      });
    });

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
      container.appendChild(addBtn);
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