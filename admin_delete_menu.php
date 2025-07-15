<?php
require 'db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['item_id']) || !is_numeric($data['item_id'])) {
    echo json_encode(["success" => false, "error" => "Missing or invalid item_id"]);
    exit;
}

$item_id = intval($data['item_id']);

$stmt = $conn->prepare("DELETE FROM item_table WHERE item_id = ?");
$stmt->bind_param("i", $item_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
