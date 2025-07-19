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

function fetchCurrentOrder() {
  fetch('get_current_order.php')
    .then(res => res.json())
    .then(data => {
      const orderTrackingSection = document.querySelector('.orderTracking-section');
      const orderIdSpan = document.getElementById('order_id');
      const itemsTable = document.getElementById('itemsTableBody');
      const totalAmount = document.getElementById('totalAmount');

      if (!data.success || !data.order) {
        orderTrackingSection.innerHTML = `<h2>No current orders :(</h2>`;
        return;
      }

      const order = data.order;
      orderIdSpan.textContent = order.order_id;
      totalAmount.textContent = order.total_price;

      itemsTable.innerHTML = '';
      order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td><img src="${item.image_url}" style="width: 50px; height: 50px;"></td>
          <td>${item.quantity}</td>
          <td>₱${item.price}</td>
          <td>₱${(item.price * item.quantity).toFixed(2)}</td>
        `;
        itemsTable.appendChild(row);
      });

      const statusBar = document.createElement('div');
      statusBar.classList.add('progressBar');
      const stages = ['Pending', 'Preparing', 'Completed'];
      const currentIndex = stages.indexOf(order.status);

      stages.forEach((stage, i) => {
        const step = document.createElement('div');
        step.className = 'progressStep';
        step.textContent = stage;
        if (i <= currentIndex) step.classList.add('active');
        statusBar.appendChild(step);
      });

      const shippingBlock = document.createElement('div');
      shippingBlock.className = 'shippingAddress';
      shippingBlock.innerHTML = `
        <h4>Shipping Address</h4>
        <p>${order.full_name}</p>
        <p>${order.address_line}</p>
        <p>${order.city}, ${order.postal_code}</p>
        <p>${order.phone_number}</p>
      `;

      orderTrackingSection.innerHTML = `<h2>Status: ${order.status}</h2>`;
      orderTrackingSection.appendChild(statusBar);
      orderTrackingSection.appendChild(shippingBlock);
    });
}

document.addEventListener('DOMContentLoaded', fetchCurrentOrder);
