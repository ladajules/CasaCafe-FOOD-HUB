const cartItems = [];
const wishlistItems = [];
let currentModalProduct = null;
let allProducts = [];
let currentProducts = [];
let currentPage = 1;
const itemsPerPage = 10;


function showPopup(message) {
  const popup = document.getElementById("popupNotification");
  const popupMessage = document.getElementById("popupMessage");

  if (popup && popupMessage) {
    popupMessage.textContent = message;
    popup.style.display = "block";

    setTimeout(() => {
      popup.style.display = "none";
    }, 7000);
  }
}

function closePopup() {
  const popup = document.getElementById("popupNotification");
  popup.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('menuContainer');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');

  const categories = ['Silog', 'Foods', 'Iced Coffee', 'Fruit Yogurt', 'MilkTea', 'Drinks'];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  fetch('menu_api.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('API error');
      }
      return response.json();
    })
    .then(data => {
      allProducts = data;
      currentProducts = data;
      currentPage = 1;
      renderProducts(allProducts);
    })
    .catch(error => {
      console.error('Fetch failed:', error);
      container.innerHTML = '<p class="error-message">Failed to load menu.</p>';
    });

  function renderProducts(products) {
    const totalProducts = products.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = '';

    if (visibleProducts.length === 0) {
      container.innerHTML = '<p class="error-message">No items match your search.</p>';
      if (paginationControls) {
        paginationControls.style.display = 'none';
      }
      return;
    }

    visibleProducts.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('menu-item');

      const img = document.createElement('img');
      img.src = item.item_image || 'fallback.png';
      img.alt = item.item_name;
      img.classList.add('item-img');

      const name = document.createElement('h3');
      name.textContent = item.item_name;
      name.classList.add('item-name');

      const desc = document.createElement('p');
      desc.textContent = item.item_description;
      desc.classList.add('item-desc');

      const price = document.createElement('p');
      price.classList.add('item-price');
      price.textContent = `₱${item.item_price}`;

      const variantContainer = document.createElement('div');
      variantContainer.classList.add('variant-container');

      let variantSelect = null;

      if (item.variants && item.variants.length > 0) {
        variantSelect = document.createElement('select');
        variantSelect.classList.add('variant-dropdown');
        variantSelect.setAttribute('data-item-id', item.item_id);

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an option';
        variantSelect.appendChild(defaultOption);

        item.variants.forEach(variant => {
          const option = document.createElement('option');
          option.value = variant.variant_id;
          option.textContent = variant.variant_name;
          option.setAttribute('data-price', variant.variant_price);
          variantSelect.appendChild(option);
        });

        variantSelect.addEventListener('change', function () {
          const selectedOption = this.options[this.selectedIndex];
          const variantPrice = selectedOption.getAttribute('data-price');

          if (variantPrice) {
            price.textContent = `₱${parseFloat(variantPrice).toFixed(2)}`;
          } else {
            price.textContent = `₱${parseFloat(item.item_price).toFixed(2)}`;
          }
        });

        variantContainer.appendChild(variantSelect);
      }

      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = 1;
      quantity.value = 1;
      quantity.classList.add("qty-input");

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      const cartBtn = document.createElement('button');
      cartBtn.textContent = 'Add to Cart';
      cartBtn.classList.add('cartBtn');

      const wishlistBtn = document.createElement('button');
      wishlistBtn.textContent = item.is_favorite ? '♥︎' : '♡';
      wishlistBtn.classList.add('wishlistBtn');

      cartBtn.addEventListener('click', () => {
        const selectedVariantId = variantSelect ? variantSelect.value : null;
        const selectedVariantText = getSelectedText(variantSelect);

        if (variantSelect && selectedVariantId === "") {
          showPopup("Please select a variant before adding to cart.");
          return;
        }

        const variantPrice = variantSelect
          ? variantSelect.options[variantSelect.selectedIndex].getAttribute("data-price") || item.item_price
          : item.item_price;

        const qty = parseInt(quantity.value) || 1;

        const product = {
          item_id: item.item_id,
          title: item.item_name,
          price: parseFloat(variantPrice).toFixed(2),
          img: item.item_image || 'fallback.png',
          variant_id: selectedVariantId !== '' ? selectedVariantId : null,
          variantText: selectedVariantText,
          quantity: qty
        };

        fetch('add_to_cart.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          body: new URLSearchParams({
            item_id: product.item_id,
            quantity: product.quantity,
            variant_id: product.variant_id ?? ''
          })
        })
          .then(response => response.text())
          .then(text => {
            if (text.includes('successfully')) {
              showPopup(`${product.title} ${product.variantText} added to cart`);

              let cart = JSON.parse(localStorage.getItem('cart') || '[]');
              if (!Array.isArray(cart)) cart = [];

              const exists = cart.some(
                p => p.item_id === product.item_id &&
                  p.variant_id == product.variant_id
              );

              if (!exists) {
                cart.push({
                  item_id: product.item_id,
                  title: product.title,
                  price: product.price,
                  img: product.img,
                  quantity: product.quantity,
                  variant: product.variantText,
                  variant_id: product.variant_id
                });

                localStorage.setItem('cart', JSON.stringify(cart));
              }
            } else {
              showPopup(`Failed to add to cart: ${text}`);
            }
          })
          .catch(error => {
            console.error('Error adding to cart:', error);
            showPopup('Error adding to cart.');
          });
      });

      wishlistBtn.addEventListener('click', () => {
        const selectedVariantText = getSelectedText(variantSelect);

        const product = {
          item_id: item.item_id,
          title: item.item_name,
          price: item.item_price,
          img: item.item_image || 'fallback.png',
          variantText: selectedVariantText
        };

        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!Array.isArray(wishlist)) wishlist = [];

        const exists = wishlist.some(p => p.title === product.title);

        if (!exists) {
          wishlist.push(product);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          wishlistBtn.textContent = '♥︎';
          addToFavorites(product.item_id, product.title, product.variantText);
        } else {
          wishlist = wishlist.filter(item => item.item_id !== product.item_id);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          wishlistBtn.textContent = '♡';
          removeToFavorites(product.item_id, product.title);
        }
      });

      buttonContainer.appendChild(cartBtn);
      buttonContainer.appendChild(wishlistBtn);

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(price);
      card.appendChild(variantContainer);
      card.appendChild(quantity);
      card.appendChild(buttonContainer);

      container.appendChild(card);
    });

    renderPagination(totalPages);
  }

  const searchForm = document.getElementById("searchForm");

  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      applyAllFilters();
    });
  }

  function renderPagination(totalPages) {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    paginationControls.innerHTML = '';
    if (totalPages <= 1) {
      paginationControls.style.display = 'none';
      return;
    }

    paginationControls.style.display = 'flex';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderProducts(currentProducts);
      }
    });
    paginationControls.appendChild(prevButton);

    for (let page = 1; page <= totalPages; page += 1) {
      const pageButton = document.createElement('button');
      pageButton.textContent = page;
      pageButton.classList.toggle('active', page === currentPage);
      pageButton.disabled = page === currentPage;
      pageButton.addEventListener('click', () => {
        currentPage = page;
        renderProducts(currentProducts);
      });
      paginationControls.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderProducts(currentProducts);
      }
    });
    paginationControls.appendChild(nextButton);
  }


  function getSelectedText(select) {
    return select && select.selectedIndex > 0
      ? select.options[select.selectedIndex].text
      : '';
  }

  function addToFavorites(item_id, title = '', variant = '') {
    fetch('add_to_favorites.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: new URLSearchParams({ item_id })
    })
      .then(response => response.text())
      .then(msg => {
        if (msg.includes("successfully")) {
          showPopup(`${title} added to Favorites`);
        } else if (msg.includes("already")) {
          showPopup(`${title} is already in your Favorites.`);
        } else {
          showPopup(`Failed to add to Favorites: ${msg}`);
        }
      })
      .catch(error => {
        console.error('Error adding to Favorites:', error);
        showPopup('Failed to add to Favorites.');
      });
  }


  function removeToFavorites(item_id, title = '') {
    fetch('remove_from_wishlist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: new URLSearchParams({ item_id })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showPopup(`${title} removed from Favorites`);
        } else if (data.message && data.message.includes("not found")) {
          showPopup(`${title} is not in your Favorites.`);
        } else {
          showPopup(`Failed to remove from Favorites: ${data.message}`);
        }
      })
      .catch(error => {
        console.error('Error removing from Favorites:', error);
        showPopup('Failed to remove from Favorites.');
      })
      .finally(() => {
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        wishlist = wishlist.filter(item => item.item_id != item_id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        if (wishlist.length === 0) {
          wishlistSection.innerHTML = "<p>You currently have no favorites</p>";
        }
      });
  }


  function applyAllFilters() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    let filtered = allProducts.filter(product => {
      const matchesSearch =
        product.item_name.toLowerCase().includes(searchQuery) ||
        product.item_description.toLowerCase().includes(searchQuery) ||
        product.item_category.toLowerCase().includes(searchQuery);

      const matchesCategory =
        !selectedCategory || product.item_category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    switch (sortValue) {
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.item_price) - parseFloat(b.item_price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.item_price) - parseFloat(a.item_price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.item_name.localeCompare(b.item_name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.item_name.localeCompare(a.item_name));
        break;
    }

    currentPage = 1;
    renderProducts(filtered);
  }


  categoryFilter.addEventListener('change', applyAllFilters);
  sortSelect.addEventListener('change', applyAllFilters);

  const searchInput = document.getElementById("searchBar");
  if (searchInput) {
    searchInput.addEventListener("input", applyAllFilters);
  }

  const closeBtn = document.getElementById("popupCloseBtn");
  const popup = document.getElementById("popupNotification");

  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      closePopup();
    }
  });

});

