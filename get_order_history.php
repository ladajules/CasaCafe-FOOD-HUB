<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

session_start();
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$order_sql = "
    SELECT 
        o.order_id, o.user_id, o.address_id, o.total_price, o.status,
        o.delivery_type, o.payment_method, o.created_at,
        a.full_name, a.phone_number, a.address_line, a.city, a.postal_code
    FROM orders o
    JOIN user_addresses a ON o.address_id = a.address_id
    WHERE o.user_id = ? AND o.status IN ('Completed', 'Cancelled')
    ORDER BY o.created_at DESC
";

$order_stmt = $conn->prepare($order_sql);
$order_stmt->bind_param("i", $user_id);
$order_stmt->execute();
$order_result = $order_stmt->get_result();

$orders = [];

while ($order = $order_result->fetch_assoc()) {
    $order_id = $order['order_id'];

    $items_sql = "
        SELECT 
            i.name AS item_name,
            v.name AS variant_name,
            i.image_url,
            oi.quantity,
            oi.price
        FROM order_items oi
        JOIN items i ON oi.item_id = i.item_id
        LEFT JOIN item_variants v ON oi.variant_id = v.variant_id
        WHERE oi.order_id = ?
    ";

    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();

    $items = [];
    while ($item = $items_result->fetch_assoc()) {
        $items[] = $item;
    }

    $items_stmt->close();

    $order['items'] = $items;
    $orders[] = $order;
}

$order_stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "orders" => $orders,
    "debug_user_id" => $user_id
]);
?>
