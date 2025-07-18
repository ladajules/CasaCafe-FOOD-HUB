<?php
session_start();
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

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];
$item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
$variant_id = isset($_POST['variant_id']) ? intval($_POST['variant_id']) : null;

if (!$item_id) {
    echo json_encode(["success" => false, "message" => "Invalid item ID."]);
    exit;
}

if ($variant_id !== null) {
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND item_id = ? AND variant_id = ?");
    $stmt->bind_param("iii", $userId, $item_id, $variant_id);
} else {
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND item_id = ? AND variant_id IS NULL");
    $stmt->bind_param("ii", $userId, $item_id);
}

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Item removed."]);
    } else {
        echo json_encode(["success" => false, "message" => "Item not found."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Failed to remove item."]);
}

$stmt->close();
$conn->close();
?>
