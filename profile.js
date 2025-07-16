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
                currentUserID = data.userID;

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
            Username: newUsername,
            UserID: currentUserID
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
