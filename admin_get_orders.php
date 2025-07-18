<?php
require 'db_connection.php';
header('Content-Type: application/json');

$sql = "SELECT 
            o.order_id,
            o.user_id,
            ua.full_name,
            ua.phone_number,
            o.status,
            o.created_at,
            o.delivery_type,
            o.payment_method,
            SUM(oi.price * oi.quantity) AS total_amount
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        JOIN user_addresses ua ON o.address_id = ua.address_id
        GROUP BY o.order_id
        ORDER BY FIELD (o.status, 'Pending', 'Paid', 'Preparing', 'Completed', 'Cancelled'), o.created_at DESC";

$result = $conn->query($sql);
$orders = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            "order_id" => $row["order_id"],
            "user_id" => $row["user_id"],
            "address_id" => $row["address_id"],
            "total" => $row["total_amount"],
            "date" => $row["created_at"],
            "status" => $row["status"]
        ];
    }
    echo json_encode(["success" => true, "orders" => $orders]);
} else {
    echo json_encode(["success" => false, "orders" => []]);
}
?>
