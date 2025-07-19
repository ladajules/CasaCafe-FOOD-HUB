<?php
require_once 'db_connection.php';
header('Content-Type: application/json');

$order_id = isset($_GET['order_id']) ? $_GET['order_id'] : (isset($_POST['order_id']) ? $_POST['order_id'] : null);

if (!$order_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing order_id."
    ]);
    exit;
}

// kani e fetch ang orders and ang customer info yeryerr
$order_sql = "
    SELECT 
        o.order_id,
        o.user_id,
        o.total_price,
        o.status,
        o.delivery_type,
        o.payment_method,
        o.created_at,
        a.full_name,
        a.phone_number,
        a.address_line,
        a.city,
        a.postal_code
    FROM orders o
    JOIN user_addresses a ON o.address_id = a.address_id
    WHERE o.order_id = ?
    LIMIT 1
";

$order_stmt = $conn->prepare($order_sql);
$order_stmt->bind_param("i", $order_id);
$order_stmt->execute();
$order_result = $order_stmt->get_result();

$order_details = $order_result->fetch_assoc();
$order_stmt->close();

// fetch ang items with variants?
$items_sql = "
    SELECT 
        i.name AS item_name,
        i.image_url,
        v.name AS variant_name,
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

$order_items = [];
while ($row = $items_result->fetch_assoc()) {
    $order_items[] = $row;
}

$items_stmt->close();
$conn->close();

echo json_encode(["success" => true, "order" => $order_details, "items" => $order_items]);
?>
