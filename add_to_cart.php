<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "Not logged in.";
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $userID = $_SESSION['user_id'];
    $itemID = intval($_POST['item_id'] ?? 0);
    $variantID = isset($_POST['variant_id']) && $_POST['variant_id'] !== '' ? intval($_POST['variant_id']) : null;
    $quantity = intval($_POST['quantity'] ?? 0);

    if ($itemID <= 0 || $quantity <= 0) {
        echo "Invalid item ID or quantity.";
        exit;
    }

    try {
        $pdo = new PDO(
            "mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8",
            "s24100966_LadaMart",
            "ciscocisco"
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Determine the price based on variant or base item
        $itemPrice = 0;
        if ($variantID !== null) {
            $stmt = $pdo->prepare("SELECT price FROM item_variants WHERE variant_id = ?");
            $stmt->execute([$variantID]);
            $variantData = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($variantData) {
                $itemPrice = $variantData['price'];
            } else {
                echo "Variant not found.";
                exit;
            }
        } else {
            $stmt = $pdo->prepare("SELECT price FROM items WHERE item_id = ?");
            $stmt->execute([$itemID]);
            $itemData = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($itemData) {
                $itemPrice = $itemData['price'];
            } else {
                echo "Item not found.";
                exit;
            }
        }


        // Check if item already exists in cart with same variant
        $stmt = $pdo->prepare("SELECT quantity FROM cart WHERE user_id = ? AND item_id = ? AND variant_id " . ($variantID !== null ? "= ?" : "IS NULL"));
        $params = $variantID !== null ? [$userID, $itemID, $variantID] : [$userID, $itemID];
        $stmt->execute($params);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $updateStmt = $pdo->prepare(
                "UPDATE cart SET quantity = ?, price = ? WHERE user_id = ? AND item_id = ? AND variant_id " . ($variantID !== null ? "= ?" : "IS NULL")
            );
            $updateParams = $variantID !== null ? [$newQty, $itemPrice, $userID, $itemID, $variantID] : [$newQty, $itemPrice, $userID, $itemID];
            $updateStmt->execute($updateParams);

            echo "Cart updated successfully.";
        } else {
            $insertStmt = $pdo->prepare("INSERT INTO cart (user_id, item_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)");
            $insertStmt->execute([$userID, $itemID, $variantID, $quantity, $itemPrice]);

            echo "Item added to cart successfully.";
        }

    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage();
    }
}
?>
