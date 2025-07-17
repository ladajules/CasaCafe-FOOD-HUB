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

    $check = $conn->prepare("SELECT user_id FROM users WHERE username = :username");
    $check->execute([':username' => $username]);

    if ($check->fetch()) {
        header("Location: register.html?error=Username+already+taken");
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
    $success = $stmt->execute([
        ':username' => $username,
        ':password' => $hashed
    ]);

    if ($success) {
        $newUserId = $conn->lastInsertId();

        $fetchRole = $conn->prepare("SELECT role FROM users WHERE user_id = :user_id");
        $fetchRole->execute([':user_id' => $newUserId]);
        $roleRow = $fetchRole->fetch(PDO::FETCH_ASSOC);

        $_SESSION['user_id'] = $newUserId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $roleRow['role'] ?? 'Customer';

        echo json_encode(['success' => true, 'role' => $_SESSION['role']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed']);
    }
}
?>
