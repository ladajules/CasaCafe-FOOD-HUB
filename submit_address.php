<?php
header('Content-Type: application/json');
session_start();

require 'db_connection.php';  // Your DB connection script

// Check if user is logged in (assuming you have user session)
if (!isset($_SESSION['UserID'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// Get POST data safely
$fullName = isset($_POST['fullName']) ? trim($_POST['fullName']) : '';
$addressLine = isset($_POST['addressLine']) ? trim($_POST['addressLine']) : '';
$city = isset($_POST['city']) ? trim($_POST['city']) : '';
$postalCode = isset($_POST['postalCode']) ? trim($_POST['postalCode']) : '';
$phoneNumber = isset($_POST['phoneNumber']) ? trim($_POST['phoneNumber']) : '';
$saveAddress = isset($_POST['saveAddress']) && $_POST['saveAddress'] === '1' ? true : false;

$user_id = $_SESSION['UserID']; // assuming you store user ID in session

// Basic validation (you can add more)
if (!$fullName || !$addressLine || !$city || !$postalCode || !$phoneNumber) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// If user wants to save the address, insert it into a 'user_addresses' table
if ($saveAddress) {
    $stmt = $conn->prepare("INSERT INTO user_addresses (user_id, full_name, address_line, city, postal_code, phone_number) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss", $user_id, $fullName, $addressLine, $city, $postalCode, $phoneNumber);

    if (!$stmt->execute()) {
        echo json_encode(['error' => 'Failed to save address']);
        exit;
    }
    $stmt->close();
}

// You might want to store the address for this particular order or proceed with payment here

echo json_encode(['success' => true, 'message' => 'Address received']);
?>
