<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$host     = "localhost";
$dbname   = "s24100966_LadaMart";
$user     = "s24100966_LadaMart";
$password = "ciscocisco";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];
$itemId = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;

if ($itemId <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid item ID."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM favorites WHERE user_id = ? AND item_id = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("ii", $userId, $itemId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Item removed from Favorites."]);
    } else {
        echo json_encode(["success" => false, "message" => "Item not found in Favorites."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Execute failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
