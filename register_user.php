<?php
session_start();
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        header("Location: register.php?error=Please+fill+in+all+fields");
        exit;
    }

    if (strlen($username) < 3 || strlen($username) > 20) {
        header("Location: register.php?error=Username+must+be+3-20+characters");
        exit;
    }

    if (!preg_match("/^[a-zA-Z]+$/", $username)) {
        header("Location: register.php?error=Username+must+contain+letters+only");
        exit;
    }

    $check = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $result = $check->get_result();

    if ($result->fetch_assoc()) {
        header("Location: register.php?error=Username+already+taken");
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashed);

    if ($stmt->execute()) {

        $newUserId = $conn->insert_id;

        $_SESSION['user_id'] = $newUserId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = 'Customer';

        header("Location: login.php?success=Account+created!+Please+log+in.");
        exit;
    } else {
        header("Location: register.php?error=Registration+failed");
        exit;
    }
}
