<?php
require 'db_connection.php'; 

$newUsername = $_POST['username'] ?? '';
$user_id = $_POST['user_id'] ?? '';

if (!$username || !$user_id) {
    echo json_encode(['success' => false, 'error' => 'Missing data']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET username = ? WHERE user_id = ?");
$stmt->bind_param("si", $newUsername, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
