const cartItems = [];
const wishlistItems = [];
let currentModalProduct = null;
let allProducts = [];
let currentProducts = [];


function showPopup(message) {
  const popup = document.getElementById("popupNotification");
  const popupMessage = document.getElementById("popupMessage");

  popupMessage.textContent = message;
  popup.style.display = "block";
}

function closePopup() {
  const popup = document.getElementById("popupNotification");
  popup.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();


    showPopup("Your message has been sent successfully!");

    form.reset();
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('menuContainer');

  fetch('menu_api.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('API error');
      }
      return response.json();
    })
    .then(data => {
      container.innerHTML = ''; // clear old content

      data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('menu-item');

        const img = document.createElement('img');
        img.src = item.item_image || 'fallback.png';
        img.alt = item.item_name;
        img.width = 150;

        const name = document.createElement('h3');
        name.textContent = item.item_name;

        const desc = document.createElement('p');
        desc.textContent = item.item_description;

        const price = document.createElement('p');
        price.textContent = `Base Price: ₱${item.item_price}`;

        const variantList = document.createElement('ul');
        if (item.variants && item.variants.length > 0) {
          item.variants.forEach(variant => {
            const li = document.createElement('li');
            li.textContent = `${variant.variant_name} - ₱${variant.variant_price}`;
            variantList.appendChild(li);
          });
        }

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(price);
        card.appendChild(variantList);

        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Fetch failed:', error);
      container.innerHTML = '<p style="color:red;">Failed to load menu.</p>';
    });
});







// const createProduct = (id, title, description, category, price, img, rate) => {
//   // himuon ug variable
//   const productContainer = document.createElement("div");
//   productContainer.setAttribute("data-id", id);
//   const titleContainer = document.createElement("div");
//   const titleP = document.createElement("p");

//   const descContainer = document.createElement("div");
//   const descP = document.createElement("p");

//   const categContainer = document.createElement("div");
//   const categP = document.createElement("p");

//   const priceContainer = document.createElement("div");
//   const priceP = document.createElement("p");

//   const imgDiv = document.createElement("button");
//   const imgP = document.createElement("img");

//   const rateContainer = document.createElement("div");
//   const rateP = document.createElement("p");
//   const rateStar = document.createElement("p");

//   const buttonCont = document.createElement("section");
//   const newCont = document.createElement("Section");
//   const cartBtn = document.createElement("button");
//   const wishlistBtn = document.createElement("button");
//   const wishlistImg = document.createElement("img");

//   const infoContainer = document.createElement("section");
//   const heartIcon = document.getElementById('heartIcon');
//   let isFilled = false;

//   // const wishlistIcon = document.createElement("i");



//   // textContent
//   titleP.textContent = title;
//   descP.textContent = description;
//   categP.textContent = category;
//   priceP.textContent = `$${price.toFixed(2)}`;
//   rateP.textContent = rate;
//   rateStar.textContent = "⭐";
//   imgP.src = img;
//   imgP.alt = title;
//   wishlistImg.src = "heart outline.jpg"
//   wishlistImg.alt = "heart Button";
//   // wishlistIcon.classList.add("fa-regular", "fa-heart"); // outline heart
//   cartBtn.textContent = "Add to Cart";
//   wishlistBtn.textContent = " ";

//   //   wishlistBtn.addEventListener("click", () => {
//   //   let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//   //   const exists = wishlist.some(item => item.title === title);
//   //   const icon = wishlistBtn.querySelector("i");

//   //   if (!exists) {
//   //     wishlist.push({ title, price, img });
//   //     localStorage.setItem("wishlist", JSON.stringify(wishlist));
//   //     icon.classList.remove("fa-regular");
//   //     icon.classList.add("fa-solid");
//   //   } else {
//   //     wishlist = wishlist.filter(item => item.title !== title);
//   //     localStorage.setItem("wishlist", JSON.stringify(wishlist));
//   //     icon.classList.remove("fa-solid");
//   //     icon.classList.add("fa-regular");
//   //   }
//   // });



//   // pang himo ug class sa each details
//   wishlistImg.classList = "wishlistImg";
//   titleP.classList = "titleP";
//   descP.classList = "descP";
//   categP.classList = "categP";
//   priceP.classList = "priceP";
//   rateP.classList = "rateP";
//   rateStar.classList = "rateStar";
//   imgDiv.classList = "imgDiv";
//   imgP.classList = "imgP";
//   cartBtn.classList = "cartBtn";
//   wishlistBtn.classList = "wishlistBtn";

//   //class sa containers
//   titleContainer.classList = "titleContainer";
//   descContainer.classList = "descContainer";
//   categContainer.classList = "categContainer";
//   priceContainer.classList = "priceContainer";
//   rateContainer.classList = "rateContainer";
//   productContainer.classList = "productContainer";
//   infoContainer.classList = "infoContainer";
//   newCont.classList = "newCont";
//   buttonCont.classList = "buttonCont";




//   //eventlistener nga mogawas ang specific product

//   imgDiv.addEventListener("click", () => {
//     currentModalProduct = { title, price, img };
//     const modal = document.getElementById("productModal");
//     const modalBox = document.getElementById("productModal");

//     document.getElementById("modalImg").src = img;
//     document.getElementById("modalImg").alt = title;
//     document.getElementById("modalTitle").textContent = title;
//     document.getElementById("modalDesc").textContent = description;
//     document.getElementById("modalRate").textContent = rate;
//     document.getElementById("modalPrice").textContent = `$${price.toFixed(2)}`;


//     modalBox.dataset.id = id;
//     modal.classList.remove("hidden");

//     fetch("save_recently_viewed.php", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         product_id: id
//       })
//     });
//   });


//   // WISHLIST AND CART!!!!!!

//   const popup = document.getElementById("popupNotification");
//   const closeBtn = document.getElementById("popupCloseBtn");

//   if (closeBtn) {
//     closeBtn.addEventListener("click", closePopup);
//   }

//   window.addEventListener("click", (e) => {
//     if (e.target === popup) {
//       closePopup();
//     }
//   });

//   document.addEventListener("DOMContentLoaded", () => {
//     const popup = document.getElementById("popupNotification");
//     const closeBtn = document.getElementById("popupCloseBtn");

//     closeBtn.addEventListener("click", () => {
//       closePopup();
//     });

//     window.addEventListener("click", (e) => {
//       if (e.target === popup) {
//         closePopup();
//       }
//     });
//   });

//   wishlistBtn.addEventListener("click", () => {
//     let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
//     const exists = wishlist.some(item => item.title === title);
//     if (!exists) {
//       wishlist.push({ title, price, img });
//       localStorage.setItem("wishlist", JSON.stringify(wishlist));
//       addToWishlist(title, price, img);
//       showPopup(`${title} has been added to your Favorites.`);
//       const product = { title, price, img };
//       fetch("add_to_wishlist.php", {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(product)
//       });

//     } else {
//       showPopup("Already in Favorites.");
//     }
//   });

//   cartBtn.addEventListener("click", () => {
//     const product = { title, price, img };
//     let cart = JSON.parse(localStorage.getItem("cart")) || [];

//     const alreadyInCart = cart.some(item => item.title === title);
//     if (!alreadyInCart) {
//       cart.push(product);
//       localStorage.setItem("cart", JSON.stringify(cart));
//       showPopup(`${title} has been added to your cart.`);

//       // Call backend function to add to DB
//       addToCart(title, 1, price);
//     } else {
//       showPopup("Already in cart.");
//     }
//   });





//   // ibutang sa ang details to their containers

//   imgDiv.appendChild(imgP);

//   titleContainer.appendChild(titleP);
//   categContainer.appendChild(categP);
//   rateContainer.appendChild(rateP);
//   rateContainer.appendChild(rateStar);
//   priceContainer.appendChild(priceP);


//   //ibutang ang detail containers sa product container
//   infoContainer.appendChild(imgDiv);
//   infoContainer.appendChild(titleContainer);
//   infoContainer.appendChild(categContainer);
//   infoContainer.appendChild(rateContainer);
//   buttonCont.appendChild(priceContainer);
//   newCont.appendChild(cartBtn);
//   wishlistBtn.appendChild(wishlistImg);
//   newCont.appendChild(wishlistBtn);
//   buttonCont.appendChild(newCont);
//   productContainer.appendChild(infoContainer);
//   productContainer.appendChild(buttonCont);

//   // return ang product container
//   return productContainer;
// }

function handleSearch() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();

  if (searchTerm.trim() === "") {
    renderProducts(allProducts); // Show all if search bar is empty
    return;
  }

  const filtered = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );

  renderProducts(filtered);
}


const renderProducts = (products) => {
  currentProducts = products; // <-- Save the current displayed list
  const productsSection = document.getElementById("productsSection");
  productsSection.innerHTML = "";

  products.forEach(product => {
    const productContainer = createProduct(
      product.id,
      product.title,
      product.description,
      product.category,
      product.price,
      product.image,
      product.rating.rate
    );
    productsSection.appendChild(productContainer);
  });
};


const USER_ID = 1; // Replace this with the actual logged-in user's ID

async function loadRecentlyViewed() {
  const response = await fetch('get_recently_viewed.php');
  const recentProducts = await response.json();
  renderProducts(recentProducts);
}




const displayProducts = async () => {
  await fetchCartFromDB();
  await fetchWishlistFromDB();
  const productsSection = document.getElementById("productsSection");
  productsSection.innerHTML = '<h1>Loading...<h1>';

  try {
    const data = await fetchProducts();
    allProducts = data;
    renderProducts(data);
    productsSection.classList = "pSection";
    productsSection.innerHTML = '';

    document.getElementById("sortSelect").addEventListener("change", async function () {
      const value = this.value;

      if (value === "recently-viewed") {
        await loadRecentlyViewed(); // Load from DB and render
      } else {
        let sortedProducts = [...allProducts];

        if (value === "price-asc") {
          sortedProducts.sort((a, b) => a.price - b.price);
        } else if (value === "price-desc") {
          sortedProducts.sort((a, b) => b.price - a.price);
        } else if (value === "name-asc") {
          sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        } else if (value === "name-desc") {
          sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
        }

        renderProducts(sortedProducts);
      }
    });


    data.forEach(product => {
      const productContainer = createProduct(product.id, product.title, product.description, product.category, product.price, product.image, product.rating.rate);
      productsSection.appendChild(productContainer);
    });



    productsSection.classList = "pSection";

  } catch {
    productsSection.innerHTML = '<p>Failed to load products.</p>';
  }





};

document.addEventListener("DOMContentLoaded", () => {
  

  const modalBox = document.getElementById("productModal");
  const closeBtn = modalBox.querySelector(".close");


  closeBtn.addEventListener("click", () => {
    modalBox.classList.add("hidden");
  });


  modalBox.addEventListener("click", (e) => {
    if (e.target === modalBox) {
      modalBox.classList.add("hidden");
    }
  });

  const modalCartBtn = document.getElementById("modalCartBtn");
  const modalWishlistBtn = document.getElementById("modalWishlistBtn");

  modalCartBtn.addEventListener("click", () => {
    if (!currentModalProduct) return;
    const { title, price, img } = currentModalProduct;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = cart.some(item => item.title === title);
    if (!alreadyInCart) {
      cart.push({ title, price, img });
      localStorage.setItem("cart", JSON.stringify(cart));
      showPopup(`${title} has been added to your cart.`);
      addToCart(title, 1, price);
    } else {
      showPopup("Already in cart.");
    }
  });

  modalWishlistBtn.addEventListener("click", () => {
    if (!currentModalProduct) return;
    const { title, price, img } = currentModalProduct;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = wishlist.some(item => item.title === title);
    if (!exists) {
      wishlist.push({ title, price, img });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      addToWishlist(title, price, img);
      showPopup(`${title} has been added to your Favorites.`);
      fetch("add_to_wishlist.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, price, img })
      });
    } else {
      showPopup("Already in Favorites.");
    }
  });



  displayProducts();
  const searchInput = document.getElementById("searchBar");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

});



function checkLoginStatus() {
  return fetch('check_session.php', { credentials: 'include' })
    .then(response => response.json())
    .then(data => data.loggedIn)
    .catch(() => false);
}

function addToCartClicked(button) {
  checkLoginStatus().then(isLoggedIn => {
    if (!isLoggedIn) {
      showPopup(`You must be logged in to add items to cart.`);
      window.location.href = "login.html";
      return;
    }

    // Find product container relative to the button clicked
    const productContainer = button.closest('.products');
    if (!productContainer) {
      return;
    }

    // Extract product info
    const productNameEl = productContainer.querySelector('.product-name');
    if (!productNameEl) {
      return;
    }
    const productName = productNameEl.textContent.trim();

    const qtyInput = productContainer.querySelector('.product-quantity');
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    if (isNaN(quantity) || quantity < 1) {
      return;
    }

    const priceEl = productContainer.querySelector('.product-price');
    if (!priceEl) {
      return;
    }
    const price = parseFloat(priceEl.textContent);
    if (isNaN(price) || price < 0) {
      return;
    }

    const imgEl = productContainer.querySelector('img');
    const img = imgEl ? imgEl.src : "sample.png"; // fallback image if none

    // Update localStorage cart
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.title === productName);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        title: productName,
        price: price,
        quantity: quantity,
        img: img
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Also send to backend to save in database
    addToCart(productName, quantity, price);
  });
}

function addToCart(product, quantity, price) {
  fetch('add_to_cart.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include',
    body: `product=${encodeURIComponent(product)}&quantity=${quantity}&price=${price}`
  })
    .then(response => response.text())
    .catch(error => {
      showPopup('Failed to add item to cart.');
      console.error('Error adding to cart:', error);
    });
}

// Attach event listeners to all add-to-cart buttons (assuming class .cartBtn)
document.addEventListener("DOMContentLoaded", () => {
  const cartButtons = document.querySelectorAll('.cartBtn');
  cartButtons.forEach(button => {
    button.addEventListener('click', () => addToCartClicked(button));
  });
});


heartIcon.addEventListener('click', function (event) {
  event.preventDefault(); // prevent link action
  isFilled = !isFilled;

  heartIcon.src = isFilled ? 'darken-heart.jpg' : 'heart-outline.png';
});



async function fetchCartFromDB() {
  try {
    const response = await fetch('get_cart.php', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch cart');
    const cart = await response.json();
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchWishlistFromDB() {
  try {
    const response = await fetch('get_wishlist.php', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch Favorites');
    const wishlist = await response.json();
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    return wishlist;
  } catch (error) {
    console.error(error);
    return [];
  }
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
      if (data.success) {
        showPopup(`${title} has been added to your Favorites.`);
      } else {
        showPopup(`Failed to add to Favorites: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      console.error('Error adding to Favorites:', error);
      showPopup('Failed to add to Favorites.');
    });
}


