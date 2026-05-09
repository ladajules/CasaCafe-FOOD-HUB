<?php
header('Content-Type: application/json');
session_start();

require 'db_connection.php';
require 'check_admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
    exit();
}

if (!isset($_POST['user_id']) || !is_numeric($_POST['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid user ID'
    ]);
    exit();
}

$userId = (int) $_POST['user_id'];

$resetToken = bin2hex(random_bytes(32));

$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

try {
    $stmt = $conn->prepare("
        UPDATE users
        SET reset_token = ?,
            reset_token_expires = ?
        WHERE user_id = ?
    ");

    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param('ssi', $resetToken, $expiresAt, $userId);

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        $stmt->close();
        exit();
    }

    $stmt->close();

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        ? 'https'
        : 'http';

    $host = $_SERVER['HTTP_HOST'];

    $resetLink = $protocol . '://' . $host .
        '/reset_password.php?token=' . urlencode($resetToken);

    echo json_encode([
        'success' => true,
        'reset_token' => $resetToken,
        'reset_link' => $resetLink,
        'expires_at' => $expiresAt
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>