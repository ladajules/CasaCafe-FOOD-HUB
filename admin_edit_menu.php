<?php
require 'db_connection.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data['item_id'], $data['name'], $data['category'], $data['description'], $data['price'], $data['image_url'])) {
    $item_id = intval($data['item_id']);
    $name = $data['name'];
    $category = $data['category'];
    $description = $data['description'];
    $price = floatval($data['price']);
    $image_url = $data['image_url'];

    $stmt = $conn->prepare("UPDATE items SET 
        name = ?, 
        category = ?, 
        description = ?, 
        image_url = ?, 
        price = ? 
        WHERE item_id = ?");

    if (!$stmt) {
        echo json_encode(["success" => false, "error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param(
        "ssssdi",
        $name,
        $category,
        $description,
        $image_url,
        $price,
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
