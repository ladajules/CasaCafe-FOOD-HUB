<?php

file_put_contents("wishlist_debug.json", file_get_contents("php://input"));

header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['UserID'];

// Read raw input and decode JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// Validate input
if (!isset($data['wishlist']) || !is_array($data['wishlist'])) {
    echo json_encode(["success" => false, "error" => "Invalid wishlist data"]);
    exit;
}

$wishlist = $data['wishlist'];

// Clear previous wishlist entries for the user
$deleteStmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ?");
$deleteStmt->bind_param("i", $userId);
$deleteStmt->execute();
$deleteStmt->close();

// Insert new wishlist items
$insertStmt = $conn->prepare("INSERT INTO wishlist (user_id, title, price, img) VALUES (?, ?, ?, ?)");

foreach ($wishlist as $item) {
    if (!isset($item['title'], $item['price'], $item['img'])) continue;

    $title = $item['title'];
    $price = floatval($item['price']);
    $img = $item['img'];

    $insertStmt->bind_param("isds", $userId, $title, $price, $img);
    $insertStmt->execute();
}

$insertStmt->close();
$conn->close();

echo json_encode(["success" => true]);
