let pendingGcash = false;

function showPopup(content) {
    const popup = document.getElementById("popupNotification");
    const popupMessage = document.getElementById("popupMessage");
    popupMessage.innerHTML = content;
    popup.style.display = "block";
}

function confirmGcashPayment() {
    const popup = document.getElementById("popupNotification");
    popup.style.display = "none";
    document.getElementById("addressForm").dispatchEvent(new Event("submit"));
}

document.addEventListener("DOMContentLoaded", () => {
    const cartSection = document.getElementById("cartSection");
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const savedAddressesSelect = document.getElementById("savedAddresses");
    const addressModal = document.getElementById("addressModal");
    const closeModalBtn = document.getElementById("closeAddressModal");
    const addressForm = document.getElementById("addressForm");
    const thankYouMessage = document.getElementById("thankYouMessage");

    if (thankYouMessage) thankYouMessage.classList.remove("show");

    // Load saved addresses
    if (savedAddressesSelect) {
        fetch('get_addresses.php', { credentials: 'include' })
            .then(res => res.json())
            .then(addresses => {
                if (!Array.isArray(addresses)) return;
                addresses.forEach(addr => {
                    const option = document.createElement("option");
                    option.value = addr.id;
                    option.textContent = `${addr.full_name}, ${addr.address_line}, ${addr.city}, ${addr.postal_code}, ${addr.phone_number}`;
                    savedAddressesSelect.appendChild(option);
                });

                savedAddressesSelect.addEventListener("change", (e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;
                    const selectedAddress = addresses.find(addr => addr.id == selectedId);
                    if (!selectedAddress) return;

                    document.getElementById("fullName").value = selectedAddress.full_name;
                    document.getElementById("addressLine").value = selectedAddress.address_line;
                    document.getElementById("city").value = selectedAddress.city;
                    document.getElementById("postalCode").value = selectedAddress.postal_code;
                    document.getElementById("phoneNumber").value = selectedAddress.phone_number;
                });
            })
            .catch(err => console.error("Failed to load saved addresses:", err));
    }

    renderCart();

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            addressModal.classList.remove("hidden");
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            addressModal.classList.add("hidden");
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === addressModal) {
            addressModal.classList.add("hidden");
        }
    });

    if (addressForm) {
        addressForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value || "";
            const fullName = document.getElementById("fullName").value;
            const addressLine = document.getElementById("addressLine").value;
            const city = document.getElementById("city").value;
            const postalCode = document.getElementById("postalCode").value;
            const phoneNumber = document.getElementById("phoneNumber").value;
            const saveAddress = document.getElementById("saveAddress").checked;
            const paymentMethod = document.getElementById("paymentMethod").value;

            const cartFromStorage = JSON.parse(localStorage.getItem("cart")) || [];
            const cartForCheckout = cartFromStorage.map(item => ({
                product_name: item.title,
                quantity: item.quantity,
                price: item.price,
                img: item.img
            }));

            if (paymentMethod === "Gcash" && !pendingGcash) {
                showPopup(`
    <h3 style="margin-top: 0;">Scan to Pay with GCash</h3>
    <img src="gcash_qr.png" alt="GCash QR Code"
         style="max-width: 300px; width: 100%; display: block; margin: 20px auto;">
    <button onclick="confirmGcashPayment()" 
            style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
        I have paid
    </button>
`);

                pendingGcash = true;
                return;
            }

            fetch("checkout.php", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cart: cartForCheckout,
                    user_address: {
                        fullName,
                        addressLine,
                        city,
                        postalCode,
                        phoneNumber,
                        saveAddress
                    },
                    deliveryType,
                    paymentMethod
                })
            })
                .then(res => res.text())
                .then(text => {
                    console.log("Raw response text:", text);
                    return JSON.parse(text);
                })
                .then(data => {
                    if (data.success) {
                        localStorage.removeItem("cart");
                        cartSection.innerHTML = "";
                        totalPriceDisplay.textContent = "";
                        addressModal.classList.add("hidden");
                        checkoutBtn.classList.add("hidden");
                        if (thankYouMessage) thankYouMessage.classList.add("show");
                        if (homeBtn) homeBtn.classList.add("show");
                    } else {
                        alert("Checkout failed: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Checkout error:", err);
                    alert("Something went wrong during checkout.");
                });
        });
    }
});

// keep your existing renderCart(), updateTotalPrice(), addToCartClicked(), etc.
// no changes needed there for this feature

function renderCart() {
    const cartSection = document.getElementById("cartSection");
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");

    fetch('get_cart.php', { credentials: 'include' })
        .then(response => response.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
            cartSection.innerHTML = "";

            if (!Array.isArray(cart) || cart.length === 0) {
                cartSection.innerHTML = "<p>Your cart is empty.</p>";
                totalPriceDisplay.textContent = "";
                return;
            }

            cart.forEach((product, index) => {
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
                price.textContent = `₱${product.price.toFixed(2)}`;
                price.classList = "priceP";

                if (product.variant && product.variant.trim() !== "") {
                    const variant = document.createElement("p");
                    variant.textContent = `Variant: ${product.variant}`;
                    variant.classList = "variantP";
                    cartDescription.appendChild(variant);
                }

                const quantity = document.createElement("input");
                quantity.type = "number";
                quantity.min = 1;
                quantity.value = product.quantity || 1;
                quantity.classList = "qty-input";

                quantity.addEventListener("change", (e) => {
                    const newQty = parseInt(e.target.value);
                    if (newQty < 1) {
                        quantity.value = 1;
                        return;
                    }
                    product.quantity = newQty;
                    updateTotalPrice(cart);
                    updateCartQuantity(product.title, newQty);
                });

                const removeBtn = document.createElement("button");
                removeBtn.textContent = "Remove";
                removeBtn.classList = "remove-btn";

                removeBtn.addEventListener("click", () => {
                    removeFromCart(product.title, product.variant || '');
                });

                imageCont.appendChild(img);
                container.appendChild(imageCont);
                cartDescription.appendChild(title);
                cartDescription.appendChild(price);
                cartDescription.appendChild(quantity);
                container.appendChild(cartDescription);
                container.appendChild(removeBtn);

                cartSection.appendChild(container);
            });

            updateTotalPrice(cart);
        })
        .catch(error => {
            console.error("Error loading cart from DB:", error);
            cartSection.innerHTML = "<p>Failed to load cart.</p>";
        });
}


function removeFromCart(productName, variant = '') {
    fetch('remove_from_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: `product_name=${encodeURIComponent(productName)}&variant=${encodeURIComponent(variant)}`
    })
        .then(response => response.text())
        .then(() => {
            return fetch('get_cart.php', { credentials: 'include' });
        })
        .then(res => res.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
            updateTotalPrice(cart);
            renderCart();
        })
        .catch(error => {
            console.error("Error removing item or syncing cart:", error);
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