<?php
session_start();

if (!isset($_SESSION['UserID'])) {
    echo "Not logged in.";
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $userID = $_SESSION['UserID'];
    $product = strip_tags(trim($_POST['product'] ?? ''));
    $quantity = intval($_POST['quantity'] ?? 0);
    $price = floatval($_POST['price'] ?? 0);

    if ($product === '' || $quantity <= 0 || $price <= 0) {
        echo "Invalid product, quantity, or price.";
        exit;
    }

    try {
        // Connect to database
        $pdo = new PDO(
            "mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8",
            "s24100966_LadaMart",
            "ciscocisco"
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Fetch product list from API
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

        // If exact match found, update product name
        if ($exactTitle !== '') {
            $product = $exactTitle;
        }

        // Check if product already exists in cart
        $stmt = $pdo->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_name = ?");
        $stmt->execute([$userID, $product]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $updateStmt = $pdo->prepare("UPDATE cart SET quantity = ?, price = ?, img = ? WHERE user_id = ? AND product_name = ?");
            $updateStmt->execute([$newQty, $price, $img, $userID, $product]);
            echo "Cart updated successfully.";
        } else {
            $insertStmt = $pdo->prepare("INSERT INTO cart (user_id, product_name, quantity, price, img) VALUES (?, ?, ?, ?, ?)");
            $insertStmt->execute([$userID, $product, $quantity, $price, $img]);
            echo "Item added to cart successfully.";
        }
    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage();
    }
}
?>
