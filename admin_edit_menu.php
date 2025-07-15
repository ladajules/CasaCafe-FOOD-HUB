<?php
require 'db_connection.php'; 

$data = json_decode(file_get_contents('php://input'), true);
error_log("Incoming JSON: " . file_get_contents('php://input'));

if (
  isset($data['item_id'], $data['item_name'], $data['item_category'],
        $data['item_description'], $data['item_price'], $data['item_image'])
) {
  $stmt = $conn->prepare("UPDATE menu SET item_name = ?, item_category = ?, item_description = ?, item_price = ?, item_image = ? WHERE item_id = ?");
  $stmt->bind_param(
    "sssisi",
    $data['item_name'],
    $data['item_category'],
    $data['item_description'],
    $data['item_price'],
    $data['item_image'],
    $data['item_id']
  );

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
