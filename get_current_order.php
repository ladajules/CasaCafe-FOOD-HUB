<?php
require 'db_connection.php';
session_start();

$user_id = $_SESSION['user_id'] ?? $_COOKIE['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false]);
    exit;
}

$orderQuery = $conn->prepare("SELECT o.*, a.full_name, a.address_line, a.city, a.postal_code, a.phone_number
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

$itemQuery = $conn->prepare("SELECT oi.quantity, oi.price, i.name, i.image_url
                            FROM order_items oi
                            JOIN items i ON oi.item_id = i.item_id
                            WHERE oi.order_id = ?");
$itemQuery->bind_param("i", $order['order_id']);
$itemQuery->execute();
$itemsResult = $itemQuery->get_result();

$items = [];
while ($row = $itemsResult->fetch_assoc()) {
    $items[] = $row;
}

$order['items'] = $items;

echo json_encode(['success' => true, 'order' => $order]);
?>
