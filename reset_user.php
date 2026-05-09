<?php
require_once 'db_connection.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Invalid request.");
}

if (!isset($_POST['token']) || !isset($_POST['password'])) {
    die("Missing data.");
}

$token = trim($_POST['token']);
$password = $_POST['password'];

$stmt = $conn->prepare("
    SELECT user_id, reset_token_expires
    FROM users
    WHERE reset_token = ?
    LIMIT 1
");

$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Invalid reset token.");
}

$user = $result->fetch_assoc();

if (strtotime($user['reset_token_expires']) < time()) {
    die("Reset link has expired.");
}

if (trim($password) === '') {
    header("Location: reset_password.php?token=".$token."&error=Please+fill+in+all+fields");
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$update = $conn->prepare("
    UPDATE users
    SET password = ?,
        reset_token = NULL,
        reset_token_expires = NULL
    WHERE user_id = ?
");

$update->bind_param("si", $hashedPassword, $user['user_id']);

if ($update->execute()) {
    echo "Password reset successful.";
} else {
    echo "Failed to reset password.";
}
