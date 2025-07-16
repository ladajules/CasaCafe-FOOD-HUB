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

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['UserID'];


$data = json_decode(file_get_contents("php://input"), true);

$deliveryType = $data['deliveryType'] ?? 'Delivery'; 
$paymentMethod = $data['paymentMethod'] ?? 'Cash on Delivery';


if (!$data || !isset($data['cart'], $data['user_address'])) {
    echo json_encode(["success" => false, "error" => "Invalid JSON or missing fields"]);
    exit;
}

$cart = $data['cart'];
$address = $data['user_address'];

$required = ['fullName', 'addressLine', 'city', 'postalCode', 'phoneNumber'];
foreach ($required as $field) {
    if (empty($address[$field])) {
        echo json_encode(["success" => false, "error" => "Missing address field: $field"]);
        exit;
    }
}


$conn->begin_transaction();

try {
    $stmt = $conn->prepare("INSERT INTO purchases 
    (user_id, product_name, quantity, price, img, full_name, address_line, city, postal_code, phone_number, delivery_type, payment_method, purchase_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");


    foreach ($cart as $item) {
        $stmt->bind_param(
            "isidssssssss",
            $user_id,
            $item['product_name'],
            $item['quantity'],
            $item['price'],
            $item['img'],
            $address['fullName'],
            $address['addressLine'],
            $address['city'],
            $address['postalCode'],
            $address['phoneNumber'],
            $deliveryType,
            $paymentMethod
        );


        if (!$stmt->execute()) {
            throw new Exception("Failed to insert purchase: " . $stmt->error);
        }
    }
    $stmt->close();

    // Save address if requested
    if (!empty($address['saveAddress'])) {
        $stmt2 = $conn->prepare("INSERT INTO user_addresses 
            (user_id, full_name, address_line, city, postal_code, phone_number)
            VALUES (?, ?, ?, ?, ?, ?)");

        $stmt2->bind_param(
            "isssss",
            $user_id,
            $address['fullName'],
            $address['addressLine'],
            $address['city'],
            $address['postalCode'],
            $address['phoneNumber']
        );

        if (!$stmt2->execute()) {
            throw new Exception("Failed to save address: " . $stmt2->error);
        }

        $stmt2->close();
    }

    // Clear the user's cart
    $stmt3 = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt3->bind_param("i", $user_id);

    if (!$stmt3->execute()) {
        throw new Exception("Failed to clear cart: " . $stmt3->error);
    }
    $stmt3->close();

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Checkout successful"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();

?>
