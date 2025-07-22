<?php
require 'db_connection.php';
header('Content-Type: application/json');

$user_id = $_POST['user_id'] ?? null;
$isActive = $_POST['isActive'] ?? null;

if (!$user_id || !isset($isActive)) {
    echo json_encode(['success' => false, 'error' => 'Missing user ID or status']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET isActive = ? WHERE user_id = ?");
$stmt->bind_param("ii", $isActive, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
