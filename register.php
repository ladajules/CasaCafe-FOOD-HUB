<?php
session_start();
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!$username || !$password) {
        header("Location: register.html?error=Please+fill+in+both+fields");
        exit;
    }

    $check = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $result = $check->get_result();

    if ($result->fetch_assoc()) {
        header("Location: register.html?error=Username+already+taken");
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashed);
    $success = $stmt->execute();

    if ($success) {
        $newUserId = $conn->insert_id;

        $roleStmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
        $roleStmt->bind_param("i", $newUserId);
        $roleStmt->execute();
        $roleResult = $roleStmt->get_result();
        $roleRow = $roleResult->fetch_assoc();

        $_SESSION['user_id'] = $newUserId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $roleRow['role'] ?? 'Customer';

        header("Location: login.html?success=Account+successfully+created!+Please+log+in.");
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed']);
    }
}
?>
