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

        i.item_id,
        i.name AS product_name,
        i.price AS base_price,
        i.image_url AS img,

        v_selected.name AS variant_name,
        c.variant_id AS selected_variant_id,
        v_selected.price AS selected_variant_price

    FROM cart c
    JOIN items i ON c.item_id = i.item_id
    LEFT JOIN item_variants v_selected ON c.variant_id = v_selected.variant_id
    WHERE c.user_id = ?
";

$stmt = $conn->prepare($query);

if (!$stmt) {
    die(json_encode([
        "error" => "SQL failed",
        "details" => $conn->error
    ]));
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$cart = [];

while ($row = $result->fetch_assoc()) {

    $stmt2 = $conn->prepare("
        SELECT variant_id, name, price
        FROM item_variants
        WHERE item_id = ?
    ");

    $stmt2->bind_param("i", $row['item_id']);
    $stmt2->execute();
    $res2 = $stmt2->get_result();

    $variants = [];
    while ($v = $res2->fetch_assoc()) {
        $variants[] = $v;
    }

    $price = $row["selected_variant_price"] ?? $row["base_price"];

    $cart[] = [
        'item_id' => $row['item_id'],
        'title' => $row['product_name'],
        'price' => (float)$price,
        'quantity' => (int)$row['quantity'],
        'img' => $row['img'],
        'variant' => $row['variant_name'],
        'variant_id' => $row['selected_variant_id']
    ];
}

echo json_encode($cart);
$stmt->close();
$conn->close();
