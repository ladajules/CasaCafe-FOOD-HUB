<?php
require 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_GET['order_id'])) {
    echo json_encode(["success" => false, "error" => "Missing order ID"]);
    exit;
}

$order_id = intval($_GET['order_id']);

$sql = "SELECT * FROM purchases WHERE user_id = ? AND purchase_date = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();

$details = [];
while ($row = $result->fetch_assoc()) {
    $details[] = $row;
}

if (count($details) > 0) {
    echo json_encode(["success" => true, "details" => $details]);
} else {
    echo json_encode(["success" => false, "error" => "No data found"]);
}
?>
