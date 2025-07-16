<?php
require 'db_connection.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? '';
$category = $input['category'] ?? '';
$image = $input['image'] ?? '';
$price = $input['price'] ?? '';
$description = $input['description'] ?? '';

if ($name && $category && $image && $price && $description) {
    $stmt = $conn->prepare("INSERT INTO item_table (item_name, item_category, item_image, item_price, item_description) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssds", $name, $category, $image, $price, $description);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Missing fields"]);
}
?>