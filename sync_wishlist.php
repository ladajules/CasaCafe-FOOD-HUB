<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$userId = $_SESSION['UserID'];
$wishlist = json_decode(file_get_contents('php://input'), true)['wishlist'] ?? [];

if (!is_array($wishlist)) {
    echo json_encode(["success" => false, "error" => "Invalid wishlist data"]);
    exit;
}

// Optional: Clear old wishlist for this user
$conn->query("DELETE FROM wishlist WHERE user_id = $userId");

$stmt = $conn->prepare("INSERT INTO wishlist (user_id, title, price, img) VALUES (?, ?, ?, ?)");

foreach ($wishlist as $item) {
    $title = $item['title'] ?? '';
    $price = $item['price'] ?? 0;
    $img = $item['img'] ?? '';

    $stmt->bind_param("isds", $userId, $title, $price, $img);
    $stmt->execute();
}

$stmt->close();
$conn->close();

echo json_encode(["success" => true]);
