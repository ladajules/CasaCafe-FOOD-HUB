<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['UserID'];

$stmt = $conn->prepare("SELECT product_name, price, quantity, img, variant FROM cart WHERE user_id = ?");
if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare statement."]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$cart = [];
while ($row = $result->fetch_assoc()) {
    $cart[] = [
        "title" => $row["product_name"],
        "price" => (float)$row["price"],
        "quantity" => (int)$row["quantity"],
        "img" => $row["img"],
        "variant" => $row["variant"] ?? null
    ];
}

echo json_encode($cart);
$stmt->close();
$conn->close();
?>
