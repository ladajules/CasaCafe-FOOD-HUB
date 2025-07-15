<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["error" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['UserID'];

$stmt = $conn->prepare("SELECT title, price, img FROM wishlist WHERE user_id = ?");
if (!$stmt) {
    echo json_encode(["error" => "Failed to prepare statement."]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$wishlist = [];
while ($row = $result->fetch_assoc()) {
    $wishlist[] = [
        "title" => $row["title"],
        "price" => (float)$row["price"],
        "img" => $row["img"]
    ];
}

echo json_encode($wishlist);

$stmt->close();
$conn->close();
