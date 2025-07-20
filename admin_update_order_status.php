<?php
require 'db_connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Invalid request";
    exit;
}

$order_id = $_POST['order_id'] ?? null;
$status = $_POST['status'] ?? null;

if (!$order_id || !$status) {
    echo "Missing fields";
    exit;
}

$valid_statuses = ['Pending', 'Preparing', 'Completed', 'Cancelled'];

if (!in_array($status, $valid_statuses)) {
    echo json_encode(["success" => false, "message" => "Invalid status value"]);
    exit;
}

$sql = "UPDATE orders SET status = ? WHERE order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Status updated"]);
    exit;
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}
?>
