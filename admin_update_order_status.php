<?php
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Invalid request";
    exit;
}

$user_id = $_POST['user_id'] ?? null;
$purchase_date = $_POST['purchase_date'] ?? null;
$status = $_POST['status'] ?? null;

if (!$user_id || !$purchase_date || !$status) {
    echo "Missing fields";
    exit;
}

if (!in_array($status, ['Pending', 'Completed'])) {
    echo "Invalid status value";
    exit;
}

$sql = "UPDATE purchases SET status = ? WHERE user_id = ? AND purchase_date = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sis", $status, $user_id, $purchase_date);

if ($stmt->execute()) {
    echo "Status updated";
} else {
    echo "Failed to update status";
}
?>
