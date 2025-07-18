<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

session_start();
require 'db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['cart'])) {
    echo json_encode(["success" => false, "error" => "Missing cart data"]);
    exit;
}

$cart = $data['cart'];
$deliveryType = $data['deliveryType'] ?? 'Delivery';
$paymentMethod = $data['paymentMethod'] ?? 'Cash on Delivery';
$address_id = null;

$conn->begin_transaction();

try {
    // Handle address
    if ($deliveryType === "Pickup") {
    $stmt = $conn->prepare("SELECT id FROM user_addresses WHERE user_id = ? AND address_line = 'CasaCafe' LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($existing_id);
    if ($stmt->fetch()) {
        $address_id = $existing_id;
        $stmt->close();
    } else {
        $stmt->close();
        $stmt = $conn->prepare("INSERT INTO user_addresses (user_id, full_name, address_line, city, postal_code, phone_number) VALUES (?, 'CasaCafe', 'CasaCafe', 'Lapu-Lapu City', '6015', '09123456789')");
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            throw new Exception("Failed to save default CasaCafe address: " . $stmt->error);
        }
        $address_id = $stmt->insert_id;
        $stmt->close();
    }
}

 elseif (isset($data['user_address'])) {
        $addr = $data['user_address'];

        $required = ['fullName', 'addressLine', 'city', 'postalCode', 'phoneNumber'];
        foreach ($required as $field) {
            if (empty($addr[$field])) {
                echo json_encode(["success" => false, "error" => "Missing address field: $field"]);
                exit;
            }
        }

        $cleanNumber = str_replace(' ', '', $addr['phoneNumber']);
        if (!preg_match('/^09\d{9}$/', $cleanNumber)) {
            echo json_encode(["success" => false, "error" => "Please input a proper phone number"]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO user_addresses (user_id, full_name, address_line, city, postal_code, phone_number) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "isssss",
            $user_id,
            $addr['fullName'],
            $addr['addressLine'],
            $addr['city'],
            $addr['postalCode'],
            $cleanNumber
        );
        if (!$stmt->execute()) {
            throw new Exception("Failed to save address: " . $stmt->error);
        }

        $address_id = $stmt->insert_id;
        $stmt->close();

    } elseif (isset($data['address_id']) && $data['address_id'] > 0) {
        $address_id = (int)$data['address_id'];
    } else {
        echo json_encode(["success" => false, "error" => "Missing or invalid address"]);
        exit;
    }

    // Calculate total
    $totalPrice = 0;
    foreach ($cart as $item) {
        $totalPrice += $item['price'] * $item['quantity'];
    }

    // Insert into orders
    $stmt = $conn->prepare("INSERT INTO orders (user_id, address_id, total_price, status, delivery_type, payment_method, created_at) VALUES (?, ?, ?, 'Pending', ?, ?, NOW())");
    $stmt->bind_param("iidsss", $user_id, $address_id, $totalPrice, $deliveryType, $paymentMethod);
    if (!$stmt->execute()) {
        throw new Exception("Failed to insert order: " . $stmt->error);
    }

    $order_id = $stmt->insert_id;
    $stmt->close();

    // Clear cart
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to clear cart: " . $stmt->error);
    }

    $stmt->close();
    $conn->commit();

    echo json_encode(["success" => true, "message" => "Checkout successful", "order_id" => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();
