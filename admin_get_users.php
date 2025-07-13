<?php
session_start();
require 'db_connection.php'; 

$sql = "SELECT UserID, Username FROM login ORDER BY UserID DESC";
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
