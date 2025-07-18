<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT address_id, full_name, address_line, city, postal_code, phone_number FROM user_addresses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $addresses = [];

    while ($row = $result->fetch_assoc()) {
        $addresses[] = $row;
    }

    echo json_encode(["success" => true, "addresses" => $addresses]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to fetch addresses"]);
}

$stmt->close();
$conn->close();
