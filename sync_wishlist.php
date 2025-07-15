<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['UserID'];
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['wishlist']) || !is_array($data['wishlist'])) {
    echo json_encode(["success" => false, "error" => "Invalid wishlist data"]);
    exit;
}

// Optional: clear current wishlist for user before syncing
$conn->query("DELETE FROM wishlist WHERE user_id = $userId");

$stmt = $conn->prepare("INSERT INTO wishlist (user_id, title, price, img) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Failed to prepare statement"]);
    exit;
}

foreach ($data['wishlist'] as $item) {
    $title = $item['title'] ?? '';
    $price = $item['price'] ?? 0;
    $img = $item['img'] ?? '';

    if ($title === '') continue;

    $stmt->bind_param("isds", $userId, $title, $price, $img);
    $stmt->execute();
}

$stmt->close();
$conn->close();

echo json_encode(["success" => true]);
