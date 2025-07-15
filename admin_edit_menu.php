<?php
require 'db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (
    isset($data['item_id'], $data['item_name'], $data['item_category'],
          $data['item_description'], $data['item_price'], $data['item_image']) &&
    is_numeric($data['item_id']) && is_numeric($data['item_price'])
) {
    $item_id = intval($data['item_id']);
    $item_name = $data['item_name'];
    $item_category = $data['item_category'];
    $item_description = $data['item_description'];
    $item_price = floatval($data['item_price']);
    $item_image = $data['item_image'];

    $stmt = $conn->prepare("UPDATE item_table SET 
        item_name = ?, 
        item_category = ?, 
        item_description = ?, 
        item_image = ?, 
        item_price = ? 
        WHERE item_id = ?");

    if (!$stmt) {
        echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param(
        "ssssdi",
        $item_name,
        $item_category,
        $item_description,
        $item_image,
        $item_price,
        $item_id
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Missing or invalid fields"]);
}

$conn->close();
?>
