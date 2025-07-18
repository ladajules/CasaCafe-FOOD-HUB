<?php
session_start();
require 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$fullName     = $_POST['fullName'] ?? '';
$addressLine  = $_POST['addressLine'] ?? '';
$city         = $_POST['city'] ?? '';
$postalCode   = $_POST['postalCode'] ?? '';
$phoneNumber  = $_POST['phoneNumber'] ?? '';

if (empty($fullName) || empty($addressLine) || empty($city) || empty($postalCode) || empty($phoneNumber)) {
    echo json_encode(['error' => 'Please fill all required fields']);
    exit;
}

$stmt = $conn->prepare("SELECT address_id FROM addresses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $address_id = $row['address_id'];

    $update = $conn->prepare("UPDATE addresses 
        SET full_name = ?, address_line = ?, city = ?, postal_code = ?, phone_number = ?, updated_at = NOW() 
        WHERE address_id = ?");
    $update->bind_param("sssssi", $fullName, $addressLine, $city, $postalCode, $phoneNumber, $address_id);
    $update->execute();

    echo json_encode(['success' => true, 'message' => 'Address updated']);
    $update->close();
} else {
    $insert = $conn->prepare("INSERT INTO addresses 
        (user_id, full_name, address_line, city, postal_code, phone_number) 
        VALUES (?, ?, ?, ?, ?, ?)");
    $insert->bind_param("isssss", $user_id, $fullName, $addressLine, $city, $postalCode, $phoneNumber);
    $insert->execute();

    echo json_encode(['success' => true, 'message' => 'Address saved']);
    $insert->close();
}

$stmt->close();
$conn->close();
?>
