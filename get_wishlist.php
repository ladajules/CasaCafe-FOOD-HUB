<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT title, price, img FROM favorites WHERE user_id = ?");
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

echo json_encode([
    "success" => true,
    "wishlist" => $wishlist
]);

$stmt->close();
$conn->close();
