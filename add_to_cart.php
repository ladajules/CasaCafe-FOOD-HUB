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

        // Check if item already exists in cart with same variant
        $stmt = $pdo->prepare("SELECT quantity FROM cart WHERE user_id = ? AND item_id = ? AND variant_id " . ($variantID !== null ? "= ?" : "IS NULL"));
        $params = $variantID !== null ? [$userID, $itemID, $variantID] : [$userID, $itemID];
        $stmt->execute($params);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $updateStmt = $pdo->prepare(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND item_id = ? AND variant_id " . ($variantID !== null ? "= ?" : "IS NULL")
            );
            $updateParams = $variantID !== null ? [$newQty, $userID, $itemID, $variantID] : [$newQty, $userID, $itemID];
            $updateStmt->execute($updateParams);

            echo "Cart updated successfully.";
        } else {
            $insertStmt = $pdo->prepare("INSERT INTO cart (user_id, item_id, variant_id, quantity) VALUES (?, ?, ?, ?)");
            $insertStmt->execute([$userID, $itemID, $variantID, $quantity]);

            echo "Item added to cart successfully.";
        }

    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage();
    }
}
?>
