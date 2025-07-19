
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
    let pendingGcash = false;
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
    window.confirmGcashPayment = function () {
        popup.style.display = "none";
        popupOverlay.style.display = "none";
        addressForm.requestSubmit();
    };

    function showGcashQrPopup() {
        showPopup(`
        <div id="qrPopupContent">
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
                nextBtn.addEventListener("click", showOrderConfirmationPopup);
            }
        }, 50);
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
            <button id="backToQrBtn" style="margin-right: 10px;">Back</button>
            <a href="profile.html"><button id="confirmationButton" style="background-color: green;">Confirm</button></a>
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
        fetch("checkout.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutPayload)
        })
            .then(res => res.text())
            .then(text => {
                console.log("Raw response:", text);
                return JSON.parse(text);
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
                        <p><strong>Status:</strong> ${checkoutPayload.paymentMethod === "Gcash" ? "Pending Payment" : "Paid"}</p>
                        <a href="profile.html">
                            <button style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
                                Go to Orders
                            </button>
                        </a>
                    `;
                    }
                    document.getElementById("cartWrapper").style.display = "none";
                    document.getElementById("homeBtn").classList.add("show");
                    document.getElementById("statusBtn").classList.add("show");
                } else {
                    showPopup("Checkout failed: " + data.error);
                }
            })
            .catch(err => {
                console.error("Checkout error:", err);
                showPopup("Something went wrong during checkout.");
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
                // there must be something here ciscow
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



            if (paymentMethod === "Gcash") {
                checkoutPayload = payload;
                showGcashQrPopup();
                return;
            }



            fetch("checkout.php", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
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

                        if (thankYouMessage) {
                            showPopup(`
                            <h3 style="margin-top: 0;">Order Details</h3>
                            <button onclick="showQrCode()"
                                style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
                                Back
                            </button>
                            <a href="profile.html"><button onclick="confirmGcashPayment()"
                                style="padding: 10px 20px; font-weight: bold; margin-top: 10px;">
                                Confirm
                            </button></a>
                        `);
                        }

                        document.getElementById("cartWrapper").style.display = "none";
                        document.getElementById("homeBtn").classList.add("show");
                        document.getElementById("statusBtn").classList.add("show");
                    } else {
                        showPopup("Checkout failed: " + data.error);
                    }
                })
                .catch(err => {
                    console.error("Checkout error:", err);
                    showPopup("Something went wrong during checkout.");
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
                cartSection.innerHTML = "<p>Your cart is empty.</p>";
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
            return fetch('get_cart.php', { credentials: 'include' });
        })
        .then(res => res.json())
        .then(cart => {
            localStorage.setItem("cart", JSON.stringify(cart));
            updateTotalPrice(cart);
        })
        .catch(error => {
            console.error("Error updating quantity or syncing cart:", error);
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