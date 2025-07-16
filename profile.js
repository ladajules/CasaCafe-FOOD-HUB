function fetchPurchasedItems() {
    fetch('get_purchased_items.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('purchasedItemsContainer');
                container.innerHTML = ''; // Clear previous content if any

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
                console.error('Failed to load purchased items:', data.message);
            }
        })
        .catch(err => console.error(err));

}


document.addEventListener("DOMContentLoaded", async () => {
    const purchasedSection = document.getElementById("purchasedSection");
    const purchased = await fetchPurchasedItems();

    if (purchased.length === 0) {
        purchasedSection.innerHTML = "<p>You have no purchased items.</p>";
        return;
    }

    purchased.forEach(product => {
        const container = document.createElement("div");
        container.classList.add("productContainer");

        const img = document.createElement("img");
        img.src = product.img;
        img.alt = product.product_name;
        img.classList.add("imgP");

        const title = document.createElement("p");
        title.textContent = product.product_name;
        title.classList.add("titleP");

        const price = document.createElement("p");
        price.textContent = `$${parseFloat(product.price).toFixed(2)}`;
        price.classList.add("priceP");

        const qty = document.createElement("p");
        qty.textContent = `Quantity: ${product.quantity}`;
        qty.classList.add("quantityP");

        container.appendChild(img);
        container.appendChild(title);
        container.appendChild(price);
        container.appendChild(qty);

        purchasedSection.appendChild(container);
    });
});

let currentUserID = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch("getUser.php")
        .then(res => res.json())
        .then(data => {
            document.getElementById("usernameDisplay").textContent = data.username;
            editUsernameInput.value = data.username;
            currentUserID = data.userID; 

            document.querySelector('.edit-btn').addEventListener('click', () => {
                openModal('editModal');
            });
        })
        .catch(err => console.error(err));
});

const editModal = document.getElementById("editModal");
const editUsernameInput = document.getElementById("editUsernameInput");

function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}

document.getElementById('saveEditBtn').addEventListener('click', () => {
    const newUsername = editUsernameInput.value.trim();
    if (newUsername && currentUserID) {
        fetch('edit_users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `Username=${encodeURIComponent(newUsername)}&UserID=${encodeURIComponent(currentUserID)}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeModal('editModal');
                location.reload();
            } else {
                alert('Edit failed: ' + data.error);
            }
        });
    } else {
        alert("Missing username or user ID.");
    }
});