function fetchPurchasedItems() {
    fetch('get_purchased_items.php')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('purchasedItemsContainer');
            container.innerHTML = '';

            if (data.success && data.products.length > 0) {
                data.products.forEach(product => {
                    const item = document.createElement('div');
                    item.classList.add('product-item');

                    const image = document.createElement('img');
                    image.src = product.img;
                    image.alt = product.product_name;
                    image.classList.add('product-image');

                    const name = document.createElement('h3');
                    name.textContent = product.product_name;
                    name.classList.add('product-name');

                    const price = document.createElement('p');
                    price.textContent = `Price: ₱${product.price}`;
                    price.classList.add('product-price');

                    const quantity = document.createElement('p');
                    quantity.textContent = `Quantity: ${product.quantity}`;
                    quantity.classList.add('product-quantity');

                    item.appendChild(image);
                    item.appendChild(name);
                    item.appendChild(price);
                    item.appendChild(quantity);

                    container.appendChild(item);
                });
            } else {
                container.innerHTML = "<p>You have no purchased items.</p>";
            }
        })
        .catch(err => console.error('Failed to load purchased items:', err));
}

let currentUserID = null;
let editUsernameInput;
let editModal;

document.addEventListener('DOMContentLoaded', () => {
    editUsernameInput = document.getElementById("editUsernameInput");
    editModal = document.getElementById("editModal");

    fetch("getUser.php")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById("usernameDisplay").textContent = data.username;
                editUsernameInput.value = data.username;
                currentUserID = data.user_id;

                document.querySelector('.edit-btn').addEventListener('click', () => {
                    openModal('editModal');
                });
            } else {
                alert(data.error || "Failed to load user.");
            }
        })
        .catch(err => console.error(err));

    fetchPurchasedItems();
});

function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}

document.getElementById('saveEditBtn').addEventListener('click', () => {
    const newUsername = editUsernameInput.value.trim();
    if (newUsername && currentUserID) {
        const bodyData = new URLSearchParams({
            username: newUsername,
            user_id: currentUserID
        });

        fetch('edit_users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeModal('editModal');
                location.reload();
            } else {
                alert('Edit failed: ' + data.error);
            }
        })
        .catch(err => {
            alert("An error occurred during update.");
            console.error(err);
        });
    } else {
        alert("Missing username or user ID.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const orderTrackingSection = document.querySelector(".orderTracking");
    const noOrdersMsg = orderTrackingSection.querySelector("h2:nth-of-type(2)");
    const orderDetailsHTML = orderTrackingSection.innerHTML;

    fetch('get_current_orders.php')
    .then(response => response.json())
    .then(data => {
        const orderTrackingSection = document.querySelector(".orderTracking");

        if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) {
            orderTrackingSection.innerHTML = `
                <h2 style="border-bottom: 1px solid #ddd; font-size: 35px; margin-bottom: 19px;">Order Tracking</h2>
                <h2 style="font-size: 18px;">No orders yet :(</h2>
            `;
            return;
        }

        let allTrackingHTML = `<h2 style="border-bottom: 1px solid #ddd; font-size: 35px; margin-bottom: 19px;">Order Tracking</h2>`;

        data.orders.forEach(order => {
            const progressSteps = {
                "Pending": [true, false, false],
                "Preparing": [true, true, false],
                "Completed": [true, true, true],
            }[order.status] || [false, false, false];

            const stepsHTML = `
                <div class="progressBar">
                    <div class="progressStep ${progressSteps[0] ? "active" : ""}"><i class="fa-solid fa-clipboard-list"></i> Order Processed</div>
                    <div class="progressStep ${progressSteps[1] ? "active" : ""}"><i class="fa-solid fa-utensils"></i> Kitchen Is Preparing</div>
                    <div class="progressStep ${progressSteps[2] ? "active" : ""}"><i class="fa-solid fa-check"></i> Order Completed</div>
                </div>`;

            const itemsHTML = order.items.map(item => `
                <tr>
                    <td>${item.variant_name ? `${item.variant_name} ${item.item_name}` : item.item_name}</td>
                    <td><img src="${item.image_url}" alt="${item.item_name}" style="max-width: 60px;"></td>
                    <td>${item.quantity}</td>
                    <td>₱${parseFloat(item.price).toFixed(2)}</td>
                    <td>₱${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
            `).join('');

            let orderStatusMessage = "";
            if (order.status === "Pending") {
                orderStatusMessage = "Order is being processed...";
            } else if (order.status === "Preparing") {
                orderStatusMessage = "Kitchen is preparing...";
            } else if (order.status === "Completed") {
                orderStatusMessage = "Order has been completed.";
            }

            allTrackingHTML += `
                <h2 style="font-size: 20px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <span><span class="label">Order ID:</span> ${order.order_id}</span>
                    <span><span class="label">Date:</span> ${order.created_at.split(" ")[0]}</span>
                </h2>

                <div class="orderTracking-section">
                    <h2>${orderStatusMessage}</h2>
                    ${stepsHTML}
                    <h2>Shipping Address</h2>
                    <h2 style="color: gray; font-weight: 100; font-size: 15px;">
                        <i class="fa-solid fa-location-dot"></i> ${order.address_line}, ${order.city}, ${order.postal_code}
                    </h2>
                </div>

                <div class="orderTracking-section">
                    <h2>Order Items</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Image</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHTML}</tbody>
                    </table>
                </div>

                <div class="orderTracking-section">
                    <h2>Order Summary</h2>
                    <p style="font-size: 18px;"><span class="label">Order ID:</span> ${order.order_id}</p>
                    <p style="font-size: 18px;"><span class="label">Delivery Type:</span> ${order.delivery_type}</p>
                    <p style="font-size: 18px;"><span class="label">Payment Method:</span> ${order.payment_method}</p>
                    <p style="font-size: 18px;"><span class="label">Total Amount:</span> ₱${order.total_price}</p>
                </div>
            `;
        });

        orderTrackingSection.innerHTML = allTrackingHTML;
    })
    .catch(err => {
        console.error("Error fetching orders:", err);
        document.querySelector(".orderTracking").innerHTML = `
            <h2 style="border-bottom: 1px solid #ddd; font-size: 35px; margin-bottom: 19px;">Order Tracking</h2>
            <h2 style="font-size: 18px;">No orders yet :(</h2>
        `;
    });
});

