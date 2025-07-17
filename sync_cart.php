

<?php
header('Content-Type: application/json');
session_start();
require 'db_connection.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not logged in.']);
    exit;
}

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['cart'])) {
    echo json_encode(['success' => false, 'error' => 'No cart data provided.']);
    exit;
}

foreach ($data['cart'] as $item) {
    $title = $conn->real_escape_string($item['title']);
    $price = floatval($item['price']);
    $quantity = intval($item['quantity'] ?? 1);
    $img = $conn->real_escape_string($item['img']);
    $variant = strip_tags(trim($_POST['variant'] ?? ''));


    // Check if item already exists in the cart
    $check = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_name = ?");
    $check->bind_param("is", $userId, $title);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        $update = $conn->prepare("UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_name = ?");
        $update->bind_param("iis", $quantity, $userId, $title);
        $update->execute();
        $update->close();
    } else {
        $insert = $conn->prepare("INSERT INTO cart (user_id, product_name, quantity, price, img) VALUES (?, ?, ?, ?, ?)");
        $insert->bind_param("isids", $userId, $title, $quantity, $price, $img);
        $insert->execute();
        $insert->close();
    }

    $check->close();
}

echo json_encode(['success' => true]);
$conn->close();
?>
