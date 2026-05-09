<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$userId = $_SESSION['user_id'];

$query = "
    SELECT
        f.favorite_id,
        i.item_id,
        i.name AS title,
        i.price,
        i.image_url AS img
    FROM favorites f
    JOIN items i ON f.item_id = i.item_id
    WHERE f.user_id = ?
";

$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error" => $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$wishlist = [];

while ($row = $result->fetch_assoc()) {
    $wishlist[] = [
        "favorite_id" => $row["favorite_id"],
        "item_id" => $row["item_id"],
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
?>
