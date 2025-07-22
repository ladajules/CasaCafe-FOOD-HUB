<?php
require 'db_connection.php';
session_start();

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM user_addresses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$addresses = [];
while ($row = $result->fetch_assoc()) {
    $addresses[] = $row;
}

echo json_encode(['success' => true, 'addresses' => $addresses]);
?>