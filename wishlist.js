document.addEventListener("DOMContentLoaded", () => {
  const wishlistSection = document.getElementById("wishlistSection");

  fetch('check_session.php', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        fetchWishlistFromDB();
      } else {
        loadFromLocalStorage();
      }
    })
    .catch(() => {
      loadFromLocalStorage();
    });

  function fetchWishlistFromDB() {
    fetch("get_wishlist.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          wishlistSection.innerHTML = "<p>Failed to load wishlist.</p>";
          return;
        }
        localStorage.setItem("wishlist", JSON.stringify(data));
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
      if (product.variant) {
        const variant = document.createElement("p");
        variant.textContent = `Variant: ${product.variant}`;
        variant.classList = "variantP";
        cartDescription.appendChild(variant);
      }

      price.classList = "priceP";

      const addBtn = document.createElement("button");
      addBtn.textContent = "Add to Cart";
      addBtn.className = "cartBtn";
      addBtn.addEventListener("click", () => {
        addBtn.disabled = true;
        addToCart(product)
          .then(() => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            if (!cart.some(i => i.title === product.title)) {
              cart.push({ title: product.title, price: product.price, img: product.img });
              localStorage.setItem("cart", JSON.stringify(cart));
            }
            showPopup(`${product.title} added to cart`);
          })
          .catch(err => {
            console.error(err);
            showPopup(`Failed to add ${product.title} to cart.`);
          })
          .finally(() => {
            addBtn.disabled = false;
          });
      });


      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList = "remove-btn";
      removeBtn.addEventListener("click", () => {
        removeFromWishlistById(product.item_id, container);
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


  function showPopup(message) {
    const popup = document.getElementById("popupNotification");
    const popupMessage = document.getElementById("popupMessage");

    if (popup && popupMessage) {
      popupMessage.textContent = message;
      popup.style.display = "block";

      setTimeout(() => {
        popup.style.display = "none";
      }, 3000);
    }
  }

  function addToCart(product) {
    return fetch('add_to_cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: new URLSearchParams({
        item_id: product.item_id,
        quantity: 1,
        variant_id: product.variant_id ?? ''
      })
    })
      .then(response => response.text())
      .then(text => {
        if (text.includes('successfully')) {
          showPopup(`${product.title} ${product.variant || ''} added to cart`);
        } else {
          showPopup(`Failed to add to cart: ${text}`);
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        showPopup('Error adding to cart.');
      });
  }



  function removeFromWishlistById(item_id, container) {
    fetch('remove_from_wishlist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: `item_id=${encodeURIComponent(item_id)}`
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) console.warn("Failed to remove:", data.message);
      })
      .finally(() => {
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        wishlist = wishlist.filter(item => item.item_id != item_id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        container.remove();

        if (wishlist.length === 0) {
          wishlistSection.innerHTML = "<p>You currently have no favorites</p>";
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