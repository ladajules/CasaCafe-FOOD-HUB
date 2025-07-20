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
        i.price AS base_price,
        i.item_id,
        i.image_url AS img,
        v_selected.name AS variant_name,
        c.variant_id AS selected_variant_id,
        v_selected.price AS selected_variant_price,
        (
            SELECT
                JSON_ARRAYAGG(
                    JSON_OBJECT('variant_id', iv.variant_id, 'name', iv.name, 'price', iv.price)
                )
            FROM item_variants iv
            WHERE iv.item_id = i.item_id
        ) AS all_variants
    FROM cart c
    JOIN items i ON c.item_id = i.item_id
    LEFT JOIN item_variants v_selected ON c.variant_id = v_selected.variant_id
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
    $item_price = $row['selected_variant_price'] !== null ? (float)$row['selected_variant_price'] : (float)$row['base_price'];

    $cart[] = [
        'item_id' => $row['item_id'],
        "title" => $row["product_name"],
        "price" => $item_price, // Use variant price if available, otherwise base price
        "quantity" => (int)$row["quantity"],
        "img" => $row["img"],
        "variant" => $row["variant_name"] ?? null,
        "variant_id" => $row["selected_variant_id"] ?? null,
        "all_variants" => json_decode($row["all_variants"], true) ?? [] // Decode JSON string to array
    ];
}

echo json_encode($cart);
$stmt->close();
$conn->close();
?>
