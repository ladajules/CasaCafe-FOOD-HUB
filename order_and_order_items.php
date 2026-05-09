<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

// Step 1: Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

// Use user_id from session instead of POST (since it's already logged in)
$user_id = $_SESSION['user_id']; // Now we use the session user_id

// Step 2: Sanitize and retrieve data from POST request
$address_id = $_POST['address_id']; 
$total_price = $_POST['total_price']; 
$delivery_type = $_POST['delivery_type']; // 'Delivery' or 'Pickup'
$payment_method = $_POST['payment_method']; // 'Gcash' or 'Cash on Delivery'
$cart = $_POST['cart']; // Cart is expected to be an array of items

// Step 3: Insert the order into the `orders` table, including the `created_at` timestamp
$order_query = "INSERT INTO orders (user_id, address_id, total_price, status, delivery_type, payment_method, created_at) 
                VALUES (?, ?, ?, 'Pending', ?, ?, NOW())";

$order_stmt = $conn->prepare($order_query);
if ($order_stmt === false) {
    echo json_encode(["success" => false, "message" => "Error preparing order insert query"]);
    exit;
}

$order_stmt->bind_param("iidss", $user_id, $address_id, $total_price, $delivery_type, $payment_method);

if (!$order_stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to place the order"]);
    exit;
}

// Step 4: Get the generated `order_id` for use in the order_items table
$order_id = $conn->insert_id;

// Step 5: Insert order items into the `order_items` table
foreach ($cart as $item) {
    $item_id = $item['item_id'];  // This is the product_id to be inserted into order_items
    $variant_id = $item['variant_id'] ?? NULL;  // Handle if variant_id is NULL
    $quantity = $item['quantity'];
    $price = $item['price'];

    // Prepare the insert query for order items
    $item_query = "INSERT INTO order_items (order_id, item_id, variant_id, quantity, price) 
                   VALUES (?, ?, ?, ?, ?)";
    $item_stmt = $conn->prepare($item_query);
    
    if ($item_stmt === false) {
        echo json_encode(["success" => false, "message" => "Error preparing order item insert query"]);
        exit;
    }

    $item_stmt->bind_param("iiidi", $order_id, $item_id, $variant_id, $quantity, $price);

    if (!$item_stmt->execute()) {
        echo json_encode(["success" => false, "message" => "Failed to add order items"]);
        exit;
    }
}

// Step 6: Return a success response
echo json_encode([
    'success' => true,
    'order_id' => $order_id,
    'message' => 'Order successfully placed!'
]);

// Close the database connection
$conn->close();
?>
