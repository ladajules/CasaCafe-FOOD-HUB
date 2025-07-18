<?php
session_start();
require 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];
$itemId = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
$variantId = isset($_POST['variant_id']) ? intval($_POST['variant_id']) : null;
$quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 0;

if ($itemId <= 0 || $quantity < 1) {
    echo json_encode(["success" => false, "message" => "Invalid input."]);
    exit;
}

if ($variantId !== null) {
    $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND item_id = ? AND variant_id = ?");
    $stmt->bind_param("iiii", $quantity, $userId, $itemId, $variantId);
} else {
    $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND item_id = ? AND variant_id IS NULL");
    $stmt->bind_param("iii", $quantity, $userId, $itemId);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Quantity updated."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update."]);
}

$stmt->close();
$conn->close();
?>
