let savedAddresses = [];

document.addEventListener("DOMContentLoaded", () => {
    const cartSection = document.getElementById("cartSection");
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const savedAddressesSelect = document.getElementById("savedAddresses");
    const addressModal = document.getElementById("addressModal");
    const closeModalBtn = document.getElementById("closeAddressModal");
    const addressForm = document.getElementById("addressForm");
    const thankYouMessage = document.getElementById("thankYouMessage");
    const popup = document.getElementById("popupNotification");
    const popupMessage = document.getElementById("popupMessage");
    const deliveryInputs = document.querySelectorAll('input[name="deliveryType"]');
    const addressLineContainer = document.getElementById("addressLineContainer");
    const addressLineInput = document.getElementById("addressLine");
    let pendingGcash = false; // This variable seems unused, consider removing if not needed
    let checkoutPayload = null;

    function updateAddressLineVisibility() {
        const selectedDeliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value;
        if (selectedDeliveryType === "Pickup") {
            addressLineContainer.style.display = "none";
            addressLineInput.required = false;
        } else {
            addressLineContainer.style.display = "block";
            addressLineInput.required = true;
        }
    }

    updateAddressLineVisibility();

    deliveryInputs.forEach(input => {
        input.addEventListener("change", updateAddressLineVisibility);
    });

    if (thankYouMessage) thankYouMessage.classList.remove("show");

    function showPopup(message) {
        const popup = document.getElementById("popupNotification");
        const popupMessage = document.getElementById("popupMessage");

        if (popup && popupMessage) {
            popupMessage.innerHTML = message;
            popup.style.display = "block";
        }
    }

    document.getElementById("popupCloseBtn").addEventListener("click", closePopup);

    function showGcashQrPopup() {
       const total = calculateTotalPrice();
       showPopup(`
       <div id="qrPopupContent">
           <h2>Total: ₱${total.toFixed(2)}</h2>
           <h3 style="margin-top: 0;">Scan to Pay with GCash</h3>
           <img src="gcash_qr.png" alt="GCash QR Code"
               style="max-width: 300px; width: 100%; display: block; margin: 20px auto;">
           <button id="nextToConfirmBtn"
               style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
               Next
           </button>
       </div>
       `);

        setTimeout(() => {
            const nextBtn = document.getElementById("nextToConfirmBtn");
            if (nextBtn) {
                nextBtn.addEventListener("click", showOrderConfirmationGcashPopup);
            }
        }, 50);
    }


    function calculateTotalPrice() {
       const cart = JSON.parse(localStorage.getItem("cart")) || [];
       return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   }

    function showOrderConfirmationPopup() {
        const cartItems = checkoutPayload.cart.map(item =>
            `<li>${item.quantity} x ${item.product_name} — ₱${item.price}</li>`).join("");

        let addressHTML = "";

        if (checkoutPayload.deliveryType === "Pickup") {
            addressHTML = "<p><strong>Pickup:</strong> No address needed.</p>";
        } else if (checkoutPayload.address_id) {
            const savedAddr = savedAddresses.find(addr => addr.address_id == checkoutPayload.address_id);
            if (savedAddr) {
                addressHTML = `
        <p>
            <strong>Name:</strong> ${savedAddr.full_name}<br>
            <strong>Location Address:</strong> ${savedAddr.address_line}, ${savedAddr.city}<br>
            <strong>Postal Code:</strong> ${savedAddr.postal_code}<br>
            <strong>Phone:</strong> ${savedAddr.phone_number}
        </p>`;
            } else {
                addressHTML = "<p><strong>Saved address not found.</strong></p>";
            }
        } else if (checkoutPayload.user_address) {
            const addr = checkoutPayload.user_address;
            addressHTML = `
    <p>
        <strong>Name:</strong> ${addr.fullName}<br>
        <strong>Location Address:</strong> ${addr.addressLine}, ${addr.city}<br>
        <strong>Postal Code:</strong> ${addr.postalCode}<br>
        <strong>Phone:</strong> ${addr.phoneNumber}
    </p>`;
        }



        showPopup(`
        <h3>Confirm Your Order</h3>
        <p><strong>Payment:</strong> ${checkoutPayload.paymentMethod}</p>
        <p><strong>Delivery:</strong> ${checkoutPayload.deliveryType}</p>
        <div><strong>Address Details:</strong> ${addressHTML}</div>
        <ul style="text-align:left;">${cartItems}</ul>
        <div style="margin-top: 20px;">
            <button id="closeConfirmBtn" style="margin-right: 10px;">Back</button>
            <button id="confirmationButton" style="background-color: green;">Confirm</button>
        </div>
    `);

        setTimeout(() => {
            const closeConfirmBtnBtn = document.getElementById("closeConfirmBtn");
            if (closeConfirmBtnBtn) {
                closeConfirmBtnBtn.addEventListener("click", closePopup);
            }
        }, 50);

        const confirmationButton = document.getElementById("confirmationButton");
        if (confirmationButton) {
            confirmationButton.addEventListener("click", submitFinalOrder)
        }
    }


    function showOrderConfirmationGcashPopup() {
        const cartItems = checkoutPayload.cart.map(item =>
            `<li>${item.quantity} x ${item.product_name} — ₱${item.price}</li>`).join("");

        let addressHTML = "";

        if (checkoutPayload.deliveryType === "Pickup") {
            addressHTML = "<p><strong>Pickup:</strong> No address needed.</p>";
        } else if (checkoutPayload.address_id) {
            const savedAddr = savedAddresses.find(addr => addr.address_id == checkoutPayload.address_id);
            if (savedAddr) {
                addressHTML = `
        <p>
            <strong>Name:</strong> ${savedAddr.full_name}<br>
            <strong>Location Address:</strong> ${savedAddr.address_line}, ${savedAddr.city}<br>
            <strong>Postal Code:</strong> ${savedAddr.postal_code}<br>
            <strong>Phone:</strong> ${savedAddr.phone_number}
        </p>`;
            } else {
                addressHTML = "<p><strong>Saved address not found.</strong></p>";
            }
        } else if (checkoutPayload.user_address) {
            const addr = checkoutPayload.user_address;
            addressHTML = `
    <p>
        <strong>Name:</strong> ${addr.fullName}<br>
        <strong>Location Address:</strong> ${addr.addressLine}, ${addr.city}<br>
        <strong>Postal Code:</strong> ${addr.postalCode}<br>
        <strong>Phone:</strong> ${addr.phoneNumber}
    </p>`;
        }



        showPopup(`
        <h3>Confirm Your Order</h3>
        <p><strong>Payment:</strong> ${checkoutPayload.paymentMethod}</p>
        <p><strong>Delivery:</strong> ${checkoutPayload.deliveryType}</p>
        <div><strong>Address Details:</strong> ${addressHTML}</div>
        <ul style="text-align:left;">${cartItems}</ul>
        <div style="margin-top: 20px;">
            <button id="backToQrBtn" style="margin-right: 10px;">Back</button>
            <button id="confirmationButton" style="background-color: green;">Confirm</button>
        </div>
    `);

        setTimeout(() => {
            const backBtn = document.getElementById("backToQrBtn");
            if (backBtn) {
                backBtn.addEventListener("click", showGcashQrPopup);
            }
        }, 50);

        const confirmationButton = document.getElementById("confirmationButton");
        if (confirmationButton) {
            confirmationButton.addEventListener("click", submitFinalOrder)
        }
    }



    function submitFinalOrder() {
        fetch("create_order.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutPayload)
        })
        .then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
            }
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (error) {
                console.error("Failed to parse response JSON from create_order.php (GCash flow):", text);
                throw new Error("Invalid JSON response from server during order creation.");
            }
        })
        .then(data => {
            if (data.success && data.order_id) {
                const order_id = data.order_id;
                console.log("Order created successfully with ID (GCash flow):", order_id);
                const orderItemsPayload = {
                    order_id: order_id,
                    cart: checkoutPayload.cart
                };

                return fetch("add_order_items.php", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderItemsPayload)
                });
            } else {
                throw new Error("Order creation failed: " + (data.error || "Unknown error"));
            }
        })
        .then(async res => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
            }
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (error) {
                console.error("Failed to parse response JSON from add_order_items.php (GCash flow):", text);
                throw new Error("Invalid JSON response from server during adding order items.");
            }
        })
        .then(data => {
            if (data.success) {
                localStorage.removeItem("cart");
                cartSection.innerHTML = "";
                totalPriceDisplay.textContent = "";
                addressModal.classList.add("hidden");
                checkoutBtn.classList.add("hidden");

                // Close the popup
                closePopup();

                if (thankYouMessage) {
                    thankYouMessage.classList.add("show");
                    thankYouMessage.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center">
                        <h3>Thank you for your order!</h3>
                        <p>Your order has been placed successfully.</p>
                    </div>
                    `;
                }
                document.getElementById("cartWrapper").style.display = "none";
                document.getElementById("homeBtn").classList.add("show");
                document.getElementById("statusBtn").classList.add("show");
            } else {
                throw new Error("Checkout failed: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => {
            console.error("Checkout error (GCash flow):", err);
            showPopup("Something went wrong during checkout: " + err.message);
        });
    }

    if (savedAddressesSelect) {
        fetch('get_addresses.php', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (!data.success || !Array.isArray(data.addresses)) return;

                savedAddresses = data.addresses;
                const addresses = data.addresses;

                addresses.forEach(addr => {
                    const option = document.createElement("option");
                    option.value = addr.address_id;
                    option.textContent = `${addr.full_name}, ${addr.address_line}, ${addr.city}, ${addr.postal_code}, ${addr.phone_number}`;
                    savedAddressesSelect.appendChild(option);
                });

                savedAddressesSelect.addEventListener("change", (e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;

                    const selectedAddress = addresses.find(addr => addr.address_id == selectedId);
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

    if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function(e) {
        // Check if all required variants are selected
        const invalid = Array.from(document.querySelectorAll('.variant-dropdown')).some(select => !select.value);
        if (invalid) {
            e.preventDefault(); // Prevent the default action
            showPopup("Please select variants for all items");
            return; // Exit the function if validation fails
        }

        // If all variants are selected, show the address modal
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

            const fullName = document.getElementById("fullName").value;
            const addressLine = document.getElementById("addressLine").value;
            const city = document.getElementById("city").value;
            const postalCode = document.getElementById("postalCode").value;
            const phoneNumber = document.getElementById("phoneNumber").value;
            const saveAddress = document.getElementById("saveAddress").checked;
            const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

            const cartFromStorage = JSON.parse(localStorage.getItem("cart")) || [];
            const cartForCheckout = cartFromStorage.map(item => ({
                item_id: item.item_id,
                variant_id: item.variant_id || null,
                product_name: item.title,
                quantity: item.quantity,
                price: item.price,
                img: item.img
            }));

            const payload = {
                cart: cartForCheckout,
                deliveryType,
                paymentMethod
            };

            if (deliveryType === "Pickup") {
                // No specific address details needed for pickup in the payload for create_order.php
            } else if (savedAddressesSelect && savedAddressesSelect.value) {
                payload.address_id = parseInt(savedAddressesSelect.value);
            } else {
                payload.user_address = {
                    fullName,
                    addressLine,
                    city,
                    postalCode,
                    phoneNumber,
                    saveAddress
                };
            }

            // Show confirmation popup for Cash on Delivery
            if (paymentMethod === "Cash on Delivery") {
                checkoutPayload = payload; // Store payload for later use
                showOrderConfirmationPopup(); // Show the confirmation popup directly
                return;
            }

            // Handle GCash payment
            if (paymentMethod === "Gcash") {
                checkoutPayload = payload; // Store payload for later use after QR scan
                showGcashQrPopup();
                return;
            }

            // Create order for other payment methods
            fetch("create_order.php", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
                }
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error("Failed to parse response JSON from create_order.php:", text);
                    throw new Error("Invalid JSON response from server during order creation.");
                }
            })
            .then(data => {
                if (data.success && data.order_id) {
                    const order_id = data.order_id;
                    console.log("Order created successfully with ID:", order_id);

                    const orderItemsPayload = {
                        order_id: order_id,
                        cart: cartForCheckout
                    };

                    return fetch("add_order_items.php", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(orderItemsPayload)
                    });
                } else {
                    throw new Error("Order creation failed: " + (data.error || "Unknown error"));
                }
            })
            .then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
                }
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error("Failed to parse response JSON from add_order_items.php:", text);
                    throw new Error("Invalid JSON response from server during adding order items.");
                }
            })
            .then(data => {
                if (data.success) {
                    localStorage.removeItem("cart");
                    cartSection.innerHTML = "";
                    totalPriceDisplay.textContent = "";
                    addressModal.classList.add("hidden");
                    checkoutBtn.classList.add("hidden");

                    if (thankYouMessage) {
                        thankYouMessage.classList.add("show");
                        thankYouMessage.innerHTML = `
                            <h3>Thank you for your order!</h3>
                            <p>Your order has been placed successfully.</p>
                            <p><strong>Status:</strong> ${paymentMethod === "Gcash" ? "Pending Payment" : "Paid"}</p>
                            <a href="profile.html"><button style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
                                Go to Orders
                            </button></a>
                        `;
                    }
                    document.getElementById("cartWrapper").style.display = "none";
                    document.getElementById("homeBtn").classList.add("show");
                    document.getElementById("statusBtn").classList.add("show");
                } else {
                    throw new Error("Checkout failed: " + (data.error || "Unknown error"));
                }
            })
            .catch(err => {
                console.error("Checkout process error:", err);
                showPopup("Something went wrong during checkout: " + err.message);
            });
        });
    }



    renderCart();
});

function updateTotalPrice(cart) {
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");
    const total = cart.reduce((sum, item) => {
        const qty = item.quantity || 1;
        return sum + (item.price * qty);
    }, 0);
    totalPriceDisplay.textContent = `Total: ₱${total.toFixed(2)}`;
}


function renderCart() {
    const cartSection = document.getElementById("cartSection");
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");

    fetch('get_cart.php', { credentials: 'include' })
        .then(response => response.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
            cartSection.innerHTML = "";

            if (!Array.isArray(cart) || cart.length === 0) {
                cartSection.innerHTML = `<p style="font-size: 17px;">Your cart is empty :(</p>`;
                totalPriceDisplay.textContent = "";
                const checkoutBtn = document.getElementById("checkoutBtn");
                if (checkoutBtn) {
                    checkoutBtn.disabled = true;
                    checkoutBtn.style.opacity = "0.5";
                    checkoutBtn.style.cursor = "not-allowed";
                }
                return;
            } else {
                const checkoutBtn = document.getElementById("checkoutBtn");
                if (checkoutBtn) {
                    checkoutBtn.disabled = false;
                    checkoutBtn.style.opacity = "1";
                    checkoutBtn.style.cursor = "pointer";
                }
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
                    updateCartQuantity(product.item_id, newQty, product.variant_id || null);
                });

                const removeBtn = document.createElement("button");
                removeBtn.textContent = "Remove";
                removeBtn.classList = "remove-btn";
                removeBtn.addEventListener("click", () => {
                    removeFromCart(product.item_id, product.variant_id || null);
                });

                imageCont.appendChild(img);
                cartDescription.appendChild(title);

                // Add variant dropdown if product has variants
                if (product.all_variants && product.all_variants.length > 0) {
                    const variantSelect = document.createElement('select');
                    variantSelect.classList.add('variant-dropdown');
                    variantSelect.setAttribute('data-item-id', product.item_id);
                    variantSelect.setAttribute('data-old-variant-id', product.variant_id || ''); // Store old variant ID

                    // Add a default option if no variant is selected or if it's a base item
                    if (product.variant_id === null) {
                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'Select an option';
                        variantSelect.appendChild(defaultOption);
                    }


                    product.all_variants.forEach(variant => {
                        const option = document.createElement('option');
                        option.value = variant.variant_id;
                        option.textContent = variant.name;
                        option.setAttribute('data-price', variant.price);
                        if (variant.variant_id === product.variant_id) {
                            option.selected = true;
                        }
                        variantSelect.appendChild(option);
                    });

                    variantSelect.addEventListener('change', function () {
                        const newVariantId = this.value === '' ? null : parseInt(this.value);
                        const oldVariantId = this.getAttribute('data-old-variant-id') === '' ? null : parseInt(this.getAttribute('data-old-variant-id'));
                        const selectedOption = this.options[this.selectedIndex];
                        const newPrice = parseFloat(selectedOption.getAttribute('data-price'));

                        // Update the displayed price immediately
                        price.textContent = `₱${newPrice.toFixed(2)}`;

                        // Update the cart in the database
                        updateCartVariant(product.item_id, oldVariantId, newVariantId, product.quantity);

                        // Update the data-old-variant-id for future changes
                        this.setAttribute('data-old-variant-id', newVariantId || '');
                    });
                    cartDescription.appendChild(variantSelect);
                }


                cartDescription.appendChild(price);
                cartDescription.appendChild(quantity);
                container.appendChild(imageCont);
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


function updateCartQuantity(item_id, quantity, variant_id = null) {
    const formData = new URLSearchParams();
    formData.append("item_id", item_id);
    formData.append("quantity", quantity);
    if (variant_id !== null) formData.append("variant_id", variant_id);

    fetch('update_cart_quantity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: formData.toString()
    })
        .then(async response => {
            const data = await response.json();
            if (!data.success) {
                console.error("Update failed:", data.message);
                throw new Error(data.message);
            }
            // Re-fetch and re-render cart to ensure all data (including prices) is consistent
            return fetch('get_cart.php', { credentials: 'include' });
        })
        .then(res => res.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart(); // Re-render the entire cart to reflect changes
        })
        .catch(error => {
            console.error("Error updating quantity or syncing cart:", error);
        });

}

// New function to update item variant in cart
function updateCartVariant(item_id, old_variant_id, new_variant_id, quantity) {
    const formData = new URLSearchParams();
    formData.append("item_id", item_id);
    formData.append("old_variant_id", old_variant_id !== null ? old_variant_id : '');
    formData.append("new_variant_id", new_variant_id !== null ? new_variant_id : '');
    formData.append("quantity", quantity); // Pass the current quantity of the item

    fetch('update_cart_variant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: formData.toString()
    })
    .then(async response => {
        const data = await response.json();
        if (!data.success) {
            console.error("Variant update failed:", data.message);
            throw new Error(data.message);
        }
        // Re-fetch and re-render cart to ensure all data (including prices) is consistent
        return fetch('get_cart.php', { credentials: 'include' });
    })
    .then(res => res.json())
    .then(cart => {
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart(); // Re-render the entire cart to reflect changes
    })
    .catch(error => {
        console.error("Error updating variant or syncing cart:", error);
        // Optionally, revert the dropdown selection or show an error message
    });
}


function closePopup() {
    const popup = document.getElementById("popupNotification");
    popup.style.display = "none";
}



function removeFromCart(item_id, variant_id = null) {
    const body = new URLSearchParams({ item_id });
    if (variant_id !== null) {
        body.append("variant_id", variant_id);
    }

    fetch('remove_from_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: body.toString()
    })
        .then(() => fetch('get_cart.php', { credentials: 'include' }))
        .then(res => res.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
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
