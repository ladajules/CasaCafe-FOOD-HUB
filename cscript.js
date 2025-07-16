const cartItems = [];
const wishlistItems = [];
let currentModalProduct = null;
let allProducts = [];
let currentProducts = [];

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

function closePopup() {
  const popup = document.getElementById("popupNotification");
  popup.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('menuContainer');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');

  // Fixed category options
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
      renderProducts(allProducts);
    })
    .catch(error => {
      console.error('Fetch failed:', error);
      container.innerHTML = '<p class="error-message">Failed to load menu.</p>';
    });

  function renderProducts(products) {
    container.innerHTML = '';

    products.forEach(item => {
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
        const variantLabel = document.createElement('label');
        variantLabel.textContent = '';
        variantLabel.classList.add('variant-label');

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
          option.textContent = `${variant.variant_name}`;
          option.setAttribute('data-price', variant.variant_price);
          variantSelect.appendChild(option);
        });

        variantSelect.addEventListener('change', function () {
          const selectedOption = this.options[this.selectedIndex];
          const variantPrice = selectedOption.getAttribute('data-price') || 0;
          const totalPrice = (parseFloat(item.item_price)).toFixed(2);
          price.textContent = `₱${totalPrice}`;
        });

        variantContainer.appendChild(variantLabel);
        variantContainer.appendChild(variantSelect);
      }

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      const cartBtn = document.createElement('button');
      cartBtn.textContent = 'Add to Cart';
      cartBtn.classList.add('cartBtn');

      const wishlistBtn = document.createElement('button');
      wishlistBtn.textContent = '♡';
      wishlistBtn.classList.add('wishlistBtn');

      cartBtn.addEventListener('click', () => {
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

      wishlistBtn.addEventListener('click', () => {
        const product = {
          title: item.item_name,
          price: item.item_price,
          img: item.item_image || 'fallback.png'
        };
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const exists = wishlist.some(p => p.title === product.title);
        if (!exists) {
          wishlist.push(product);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          showPopup(`${product.title} has been added to your Favorites.`);
          addToWishlist(product.title, product.price, product.img);
        } else {
          showPopup('Already in Favorites.');
        }
      });

      buttonContainer.appendChild(cartBtn);
      buttonContainer.appendChild(wishlistBtn);

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(price);
      card.appendChild(variantContainer);
      card.appendChild(buttonContainer);

      container.appendChild(card);
    });
  }

  function getSelectedText(select) {
    return select && select.selectedIndex > 0
      ? select.options[select.selectedIndex].text
      : '';
  }

  function addToWishlist(title, price, img) {
    fetch('add_to_wishlist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product: { title, price: Number(price), img } })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          showPopup(`Failed to add to Favorites: ${data.error || 'Unknown error'}`);
        }
      })
      .catch(error => {
        console.error('Error adding to Favorites:', error);
        showPopup('Failed to add to Favorites.');
      });
  }

  // Apply filters and sorting whenever a filter changes
  function applyFilters() {
    let filteredProducts = [...allProducts];

    // Filter by category if selected
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(item => item.item_category === selectedCategory);
    }

    // Sort filtered products
    switch (sortSelect.value) {
      case 'price-asc':
        filteredProducts.sort((a, b) => parseFloat(a.item_price) - parseFloat(b.item_price));
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => parseFloat(b.item_price) - parseFloat(a.item_price));
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.item_name.localeCompare(b.item_name));
        break;
      case 'name-desc':
        filteredProducts.sort((a, b) => b.item_name.localeCompare(a.item_name));
        break;
      default:
        // no sorting or default order
        break;
    }

    renderProducts(filteredProducts);
  }

  categoryFilter.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);

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
