<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

session_start();
require 'db_connection.php'; // Assuming this file contains your DB connection logic

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id']; // Not directly used in this script, but good to keep for context

$conn->begin_transaction(); // Start transaction

try {
    $inputData = json_decode(file_get_contents('php://input'), true);

    // Validate if the required fields are present
    if (!isset($inputData['cart']) || !is_array($inputData['cart']) || empty($inputData['cart'])) {
        throw new Exception("Missing or invalid cart data");
    }

    if (!isset($inputData['order_id'])) {
        throw new Exception("Missing order_id");
    }

    // Extract the required data from the payload
    $order_id = $inputData['order_id'];
    $cart = $inputData['cart']; // Array of cart items

    // Prepare the SQL query for inserting order items
    // Added variant_id column
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, item_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)");

    // Check if the query preparation failed
    if (!$stmt) {
        throw new Exception("SQL query preparation failed: " . $conn->error);
    }

    // Loop through each cart item and insert it into the `order_items` table
    foreach ($cart as $item) {
        // Make sure that necessary fields are available
        if (!isset($item['item_id'], $item['quantity'], $item['price'])) {
            throw new Exception("Missing required data for an item in the cart.");
        }

        $item_id = $item['item_id'];
        $quantity = $item['quantity'];
        $price = $item['price'];
        // variant_id can be null, so check if it's set
        $variant_id = isset($item['variant_id']) ? $item['variant_id'] : null;

        // Bind parameters and execute the query
        // 'iiiid' for int, int, int (for variant_id), int, double
        $stmt->bind_param("iiiid", $order_id, $item_id, $variant_id, $quantity, $price);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert order item (Product ID: {$item_id}): " . $stmt->error);
        }
    }

    $conn->commit(); // Commit transaction if all successful
    echo json_encode(["success" => true, "message" => "Order items added successfully"]);

} catch (Exception $e) {
    $conn->rollback(); // Rollback transaction on error
    error_log("Error in add_order_items.php: " . $e->getMessage()); // Log the error
    http_response_code(500); // Set HTTP status code to 500 for server errors
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
