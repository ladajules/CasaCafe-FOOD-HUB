<?php
session_start();
header('Content-Type: application/json');
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, full_name, address_line, city, postal_code, phone_number FROM user_addresses WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$addresses = [];
while ($row = $result->fetch_assoc()) {
    $addresses[] = $row;
}

echo json_encode($addresses);
?>
