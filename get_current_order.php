<?php
require 'db_connection.php';
session_start();
header("Content-Type: application/json");

$user_id = $_SESSION['user_id'] ?? $_COOKIE['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false]);
    exit;
}

$orderQuery = $conn->prepare("SELECT 
                                o.*, 
                                a.full_name, 
                                a.address_line, 
                                a.city, 
                                a.postal_code, 
                                a.phone_number
                            FROM orders o
                            JOIN user_addresses a ON o.address_id = a.address_id
                            WHERE o.user_id = ? AND o.status IN ('Pending', 'Preparing')
                            ORDER BY o.created_at DESC LIMIT 1");
$orderQuery->bind_param("i", $user_id);
$orderQuery->execute();
$orderResult = $orderQuery->get_result();

if ($orderResult->num_rows === 0) {
    echo json_encode(['success' => false]);
    exit;
}

$order = $orderResult->fetch_assoc();

$itemQuery = $conn->prepare("SELECT 
                                i.name AS item_name,
                                i.image_url,
                                v.name AS variant_name,
                                oi.quantity,
                                oi.price
                            FROM order_items oi
                            JOIN items i ON oi.item_id = i.item_id
                            LEFT JOIN item_variants v ON oi.variant_id = v.variant_id
                            WHERE oi.order_id = ?");
$itemQuery->bind_param("i", $order_id);
$itemQuery->execute();
$itemResult = $itemQuery->get_result();

if ($itemResult->num_rows === 0) {
    echo json_encode(['success' => false]);
    exit;
}

$order_items = [];
while ($row = $itemResult->fetch_assoc()) {
    $order_items[] = $row;
}

$itemQuery->close();
$conn->close();

echo json_encode(["success" => true, "order" => $order, "items" => $order_items]);
?>
