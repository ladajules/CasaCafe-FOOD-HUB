<?php
session_start();
header('Content-Type: application/json');
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['UserID'];

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data) || !isset($data['product'])) {
    echo json_encode(['error' => 'Invalid or missing product data']);
    exit;
}

$product = $data['product'];

if (!isset($product['title'], $product['price'], $product['img'])) {
    echo json_encode(['error' => 'Missing data: title, price, or img']);
    exit;
}

$title = $product['title'];
$price = $product['price'];
$img = $product['img'];

$stmt = $conn->prepare("INSERT INTO wishlist (user_id, title, price, img) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isds", $user_id, $title, $price, $img);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
