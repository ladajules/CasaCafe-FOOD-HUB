<?php
require 'db_connection.php'; 

$data = json_decode(file_get_contents('php://input'), true);

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

    $stmt->bind_param("ssssd" . "i",
      $data['item_name'],
      $data['item_category'],
      $data['item_description'],
      $data['item_image'],
      floatval($data['item_price']),
      intval($data['item_id'])
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid fields']);
}
?>

