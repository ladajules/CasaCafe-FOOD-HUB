<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "Not logged in.";
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $userID = $_SESSION['user_id'];
    $product = strip_tags(trim($_POST['product'] ?? ''));
    $quantity = intval($_POST['quantity'] ?? 0);
    $price = floatval($_POST['price'] ?? 0);
    $variant = strip_tags(trim($_POST['variant'] ?? ''));
    $variant = $variant ?: '';

    if ($product === '' || $quantity <= 0 || $price <= 0) {
        echo "Invalid product, quantity, or price.";
        exit;
    }

    try {
        $pdo = new PDO(
            "mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8",
            "s24100966_LadaMart",
            "ciscocisco"
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/menu_api.php';
        $apiData = file_get_contents($apiUrl);
        $productList = json_decode($apiData, true);

        $img = '';
        $exactTitle = '';

        foreach ($productList as $item) {
            if (strcasecmp($item['item_name'], $product) === 0) {
                $img = $item['item_image'];
                $exactTitle = $item['item_name'];
                break;
            }
        }

        if ($exactTitle !== '') {
            $product = $exactTitle;
        }

            $stmt = $pdo->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_name = ? AND variant = ?");
            $stmt->execute([$userID, $product, $variant]);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $updateStmt = $pdo->prepare("UPDATE cart SET quantity = ?, price = ?, img = ?, variant = ? WHERE user_id = ? AND product_name = ? AND variant = ?");
            $updateStmt->execute([$newQty, $price, $img, $variant, $userID, $product, $variant]);
            

            echo "Cart updated successfully.";
        } else {
            $insertStmt = $pdo->prepare("INSERT INTO cart (user_id, product_name, quantity, price, img, variant) VALUES (?, ?, ?, ?, ?, ?)");
            $insertStmt->execute([$userID, $product, $quantity, $price, $img, $variant]);

            echo "Item added to cart successfully.";
        }
    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage();
    }
}
?>
