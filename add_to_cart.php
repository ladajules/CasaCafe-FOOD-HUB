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
        echo "Invalid product, quantity or price.";
        exit;
    }

    // 🖼️ Fetch product image from Fake Store API
    $apiData = file_get_contents('https://fakestoreapi.com/products');
    $productList = json_decode($apiData, true);

    $img = '';
    $exactTitle = '';
    foreach ($productList as $item) {
    if (stripos($item['title'], $product) !== false) {
            $img = $item['image'];
            $exactTitle = $item['title'];
            break;
        }
    }

    
    if ($img === '') {
        $img = 'https://fakestoreapi.com/img/placeholder.jpg';
    }
    if ($exactTitle !== '') {
        $product = $exactTitle;  // overwrite product with exact API title
    }

    try {
        $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // check if product already exists for this user
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
        echo "Error: " . $e->getMessage();
    }
}
?>
