<?php
require 'db_connection.php';
header('Content-Type: application/json');

$sql = "SELECT 
            MIN(p.id) AS order_id,
            p.user_id,
            p.full_name,
            p.phone_number,
            p.purchase_date,
            p.status,
            SUM(p.price * p.quantity) AS total_amount
        FROM purchases p
        GROUP BY p.user_id, p.purchase_date
        ORDER BY CASE 
            WHEN p.status = 'Pending' THEN 0 ELSE 1 END,
            purchase_date DESC";

$result = $conn->query($sql);
$orders = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            "order_id" => $row["order_id"],
            "user_id" => $row["user_id"],
            "name" => $row["full_name"],
            "phone" => $row["phone_number"],
            "date" => $row["purchase_date"],
            "status" => $row["status"],
            "total" => $row["total_amount"]
        ];
    }
    echo json_encode(["success" => true, "orders" => $orders]);
} else {
    echo json_encode(["success" => false, "orders" => []]);
}
?>
