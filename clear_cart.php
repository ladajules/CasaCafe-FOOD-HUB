<?php
session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo "User not logged in.";
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    echo "Cart cleared.";
} else {
    echo "Failed to clear cart.";
}

$stmt->close();
$conn->close();
?>
