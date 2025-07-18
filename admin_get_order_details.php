<?php
require 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_GET['order_id'])) {
    echo json_encode(["success" => false, "error" => "Missing order ID"]);
    exit;
}

$order_id = intval($_GET['order_id']); 

$sql = "SELECT 
            o.order_id,
            o.user_id,
            ua.full_name,
            ua.phone_number,
            ua.address_line,
            ua.city,
            ua.postal_code,
            o.status,
            o.created_at,
            o.delivery_type,
            o.payment_method,
            SUM(oi.price * oi.quantity) AS total_amount
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN user_addresses ua ON o.address_id = ua.address_id
        WHERE o.order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);

$stmt->execute();
$result = $stmt->get_result();
$order_details = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $order_details[] = [
            "order_id" => $row["order_id"],
            "user_id" => $row["user_id"],
            "full_name" => $row["full_name"],
            "phone_number" => $row["phone_number"],
            "address_line" => $row["address_line"],
            "city" => $row["city"],
            "postal_code" => $row["postal_code"],
            "total" => $row["total_amount"],
            "date" => $row["created_at"],
            "status" => $row["status"],
            "delivery_type" => $row["delivery_type"],
            "payment_method" => $row["payment_method"]
        ];
    }
    echo json_encode(["success" => true, "orders" => $order_details]);
} else {
    echo json_encode(["success" => false, "orders" => []]);
}

// $stmt = $conn->prepare($sql);
// $stmt->bind_param("i", $order_id);

// $stmt->execute();
// $result = $stmt->get_result();

// $details = [];
// while ($row = $result->fetch_assoc()) {
//     $details[] = $row;
// }

// if (count($details) > 0) {
//     echo json_encode(["success" => true, "details" => $details]);
// } else {
//     echo json_encode(["success" => false, "error" => "No data found"]);
// }
?>
