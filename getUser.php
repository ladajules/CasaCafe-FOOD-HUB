<?php
session_start();
require 'db_connection.php';

$debug = [];

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "error" => "Guest users are not allowed to access this page"
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];
$debug['session'] = $_SESSION;

$stmt = $conn->prepare("SELECT user_id, username FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        echo json_encode([
            "success" => true,
            "user_id" => $row['user_id'],
            "username" => $row['username']
        ]);
    } else {
        $debug['error'] = "User not found with ID $user_id";
        echo json_encode(["success" => false, "error" => "User not found"]);
    }
} else {
    $debug['error'] = "Query failed: " . $stmt->error;
    echo json_encode(["success" => false, "error" => "Query error"]);
}

$stmt->close();
$conn->close();
?>