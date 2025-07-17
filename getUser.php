<?php
session_start();
header('Content-Type: application/json');
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['username' => 'Guest']);
    exit;
}

$user_id = $_SESSION['user_id'];
$sql = "SELECT username FROM users WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$username = "Guest";
if ($row = $result->fetch_assoc()) {
    $username = htmlspecialchars($row['username']);
}

echo json_encode(['username' => $username]);

?>
