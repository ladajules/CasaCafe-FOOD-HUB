<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['UserID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$product_id = intval($data['product_id'] ?? 0);

if ($product_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
    exit;
}

$user_id = $_SESSION['UserID'];

try {
    $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Insert record to recently_viewed table
    $stmt = $pdo->prepare("INSERT INTO recently_viewed (user_id, product_id, viewed_at) VALUES (?, ?, NOW())");
    $stmt->execute([$user_id, $product_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
