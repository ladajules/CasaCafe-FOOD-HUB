<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "s24100966_LadaMart", "ciscocisco", "s24100966_LadaMart");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['item_id'], $data['item_name'], $data['item_category'],
          $data['item_description'], $data['item_price'], $data['item_image']) &&
    is_numeric($data['item_id']) && is_numeric($data['item_price'])
) {
    $stmt = $conn->prepare("UPDATE menu SET 
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
        $data['item_name'],
        $data['item_category'],
        $data['item_description'],
        $data['item_image'],
        floatval($data['item_price']),
        intval($data['item_id'])
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