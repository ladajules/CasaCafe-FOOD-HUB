<?php
require 'db_connection.php';

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

if (!in_array($status, ['Pending', 'Preparing', 'Completed'])) {
    echo "Invalid status value";
    exit;
}

$sql = "UPDATE orders SET status = ? WHERE order_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    echo "Status updated";
} else {
    echo "Failed to update status";
}
?>
