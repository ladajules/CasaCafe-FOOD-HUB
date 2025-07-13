<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['UserID'];
$title = strip_tags(trim($_POST['title'] ?? ''));

if (!$title) {
    echo json_encode(["success" => false, "message" => "Invalid product title."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND title = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

if (!$stmt->bind_param("is", $userId, $title)) {
    echo json_encode(["success" => false, "message" => "Bind failed: " . $stmt->error]);
    exit;
}

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Item removed from wishlist."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Execute failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
