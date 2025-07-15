<?php
require 'db_connection.php'; 

$data = json_decode(file_get_contents('php://input'), true);

if (
  is_array($data) &&
  array_key_exists('item_id', $data) &&
  array_key_exists('item_name', $data) &&
  array_key_exists('item_category', $data) &&
  array_key_exists('item_description', $data) &&
  array_key_exists('item_price', $data) &&
  array_key_exists('item_image', $data)
) {
  $stmt = $conn->prepare("UPDATE menu SET item_name = ?, item_category = ?, item_description = ?, item_price = ?, item_image = ? WHERE item_id = ?");
  $stmt->bind_param("sssisi",
    $data['item_id'],
    $data['item_name'],
    $data['item_category'],
    $data['item_description'],
    $data['item_price'],
    $data['item_image']
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
?>

