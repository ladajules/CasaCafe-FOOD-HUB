<?php
session_start();
header('Content-Type: application/json');

$userId = $_SESSION['user_id'] ?? null;

echo json_encode([
    "loggedIn" => $userId !== null,
    "user_id"  => $userId
]);
?>