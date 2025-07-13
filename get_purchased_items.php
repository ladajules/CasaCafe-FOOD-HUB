<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['UserID'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

require 'db_connection.php';

if ($conn->connect_errno) {
    echo json_encode(['success' => false, 'message' => 'DB connection error']);
    exit;
}

$user_id = $_SESSION['UserID'];
$sql = "SELECT product_name, quantity, price, img FROM purchases WHERE user_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL prepare failed']);
    exit;
}

$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

$purchasedProducts = [];
while ($row = $result->fetch_assoc()) {
    $purchasedProducts[] = $row;
}

echo json_encode(['success' => true, 'products' => $purchasedProducts]);
?>
