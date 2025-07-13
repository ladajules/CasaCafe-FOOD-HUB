<?php
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['UserID'];

$fullName = $_POST['fullName'] ?? '';
$addressLine = $_POST['addressLine'] ?? '';
$city = $_POST['city'] ?? '';
$postalCode = $_POST['postalCode'] ?? '';
$phoneNumber = $_POST['phoneNumber'] ?? '';

// Simple validation (you can expand this)
if (empty($fullName) || empty($addressLine) || empty($city) || empty($postalCode) || empty($phoneNumber)) {
    echo json_encode(['error' => 'Please fill all required fields']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM user_addresses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $address_id = $row['id'];

    $update = $conn->prepare("UPDATE user_addresses SET full_name=?, address_line=?, city=?, postal_code=?, phone_number=?, updated_at=NOW() WHERE id=?");
    $update->bind_param("sssssi", $fullName, $addressLine, $city, $postalCode, $phoneNumber, $address_id);
    $update->execute();

    echo json_encode(['success' => true, 'message' => 'Address updated']);
} else {
    $insert = $conn->prepare("INSERT INTO user_addresses (user_id, full_name, address_line, city, postal_code, phone_number) VALUES (?, ?, ?, ?, ?, ?)");
    $insert->bind_param("isssss", $user_id, $fullName, $addressLine, $city, $postalCode, $phoneNumber);
    $insert->execute();

    echo json_encode(['success' => true, 'message' => 'Address saved']);
}
?>
