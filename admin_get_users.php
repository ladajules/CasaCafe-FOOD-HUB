<?php
session_start();
require 'db_connection.php'; 

$sql = "SELECT user_id, username, created_at, updated_at FROM users WHERE role = 'Customer' ORDER BY user_id ASC";
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
