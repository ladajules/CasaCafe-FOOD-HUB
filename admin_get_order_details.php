<?php
require 'db_connection.php';
header('Content-Type: application/json');

file_put_contents("debug_order.txt", json_encode([
    "user_id" => $_GET['order_id'],
    "purchase_date" => $_GET['purchase_date']
]));

if (!isset($_GET['order_id']) || !isset($_GET['purchase_date'])) {
    echo json_encode(["success" => false, "error" => "Missing order ID or purchase date"]);
    exit;
}

$user_id = intval($_GET['order_id']); 
$purchase_date = $_GET['purchase_date']; 

$sql = "SELECT * FROM purchases WHERE user_id = ? AND purchase_date = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $user_id, $purchase_date);

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
