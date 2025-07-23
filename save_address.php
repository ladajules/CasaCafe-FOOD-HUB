<?php
require 'db_connection.php';
session_start();
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User not logged in']);
    exit;
}

$address_id   = $_POST['address_id'] ?? '';
$full_name    = trim($_POST['full_name'] ?? '');
$address_line = trim($_POST['address_line'] ?? '');
$city         = trim($_POST['city'] ?? '');
$postal_code  = trim($_POST['postal_code'] ?? '');
$phone_number = trim($_POST['phone_number'] ?? '');

if (!$full_name || !$address_line || !$city || !$postal_code || !$phone_number) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

if ($address_id !== '') {
    $stmt = $conn->prepare("UPDATE user_addresses 
        SET full_name = ?, address_line = ?, city = ?, postal_code = ?, phone_number = ?, updated_at = NOW() 
        WHERE address_id = ? AND user_id = ?");
    $stmt->bind_param("ssssssi", $full_name, $address_line, $city, $postal_code, $phone_number, $address_id, $user_id);
} else {
    $stmt = $conn->prepare("INSERT INTO user_addresses 
        (user_id, full_name, address_line, city, postal_code, phone_number, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->bind_param("isssss", $user_id, $full_name, $address_line, $city, $postal_code, $phone_number);
}

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
