<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['UserID'])) {
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['UserID'];

try {
    $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT product_id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 10");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $ids = array_column($rows, 'product_id');
    if (empty($ids)) {
        echo json_encode([]);
        exit;
    }

    $apiData = file_get_contents('https://fakestoreapi.com/products');
    $allProducts = json_decode($apiData, true);

    $recentProducts = array_filter($allProducts, function ($product) use ($ids) {
        return in_array($product['id'], $ids);
    });

    // preserve original view order
    usort($recentProducts, function($a, $b) use ($ids) {
        return array_search($a['id'], $ids) - array_search($b['id'], $ids);
    });

    echo json_encode(array_values($recentProducts));
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
