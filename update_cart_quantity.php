<?php
session_start();
require 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['UserID'];
$product = strip_tags(trim($_POST['product_name'] ?? ''));
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 0;

if (!$product || $quantity < 1) {
    echo json_encode(["success" => false, "message" => "Invalid input."]);
    exit;
}

$stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_name = ?");
$stmt->bind_param("iis", $quantity, $userId, $product);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Quantity updated."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update."]);
}

$stmt->close();
$conn->close();
?>
