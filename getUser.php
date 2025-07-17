<?php
session_start();
require 'db_connection.php';

$user_id = $_COOKIE['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

$stmt = $conn->prepare("SELECT user_id, username, role FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    echo json_encode([
        'success' => true,
        'user_id' => $user['user_id'],
        'username' => $user['username'],
        'role' => $user['role']
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found']);
}
?>
