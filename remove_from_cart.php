<?php
session_start();

$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!isset($_SESSION['UserID'])) {
    echo "User not logged in.";
    exit;
}

$userId = $_SESSION['UserID'];
$product = strip_tags(trim($_POST['product_name'] ?? ''));

if (!$product) {
    echo "Invalid product.";
    exit;
}

$stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_name = ?");
$stmt->bind_param("is", $userId, $product);

if ($stmt->execute()) {
    echo "Item removed.";
} else {
    echo "Failed to remove item.";
}

$stmt->close();
$conn->close();

?>
