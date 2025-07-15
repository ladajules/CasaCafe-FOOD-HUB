<?php
session_start();
require 'db_connection.php'; 

$sql = "SELECT item_id, item_name, item_category, item_description, item_price, item_image FROM item_table ORDER BY item_id ASC";
$result = $conn->query($sql);

$users = [];

if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $users[] = $row;
  }
}

header('Content-Type: application/json');
echo json_encode($users);
?>