<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];

$query = "
    SELECT 
        c.cart_id,
        c.quantity,
        i.name AS product_name,
        i.price AS price,
        i.image_url AS img,
        v.name AS variant,
        c.variant_id
    FROM cart c
    JOIN items i ON c.item_id = i.item_id
    LEFT JOIN item_variants v ON c.variant_id = v.variant_id
    WHERE c.user_id = ?
";

$stmt = $conn->prepare($query);
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
        "variant" => $row["variant"] ?? null,
        "variant_id" => $row["variant_id"] ?? null
    ];
}

echo json_encode($cart);
$stmt->close();
$conn->close();
?>
