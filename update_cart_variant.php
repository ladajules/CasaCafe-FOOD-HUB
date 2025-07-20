<?php
session_start();
header('Content-Type: application/json');

require 'db_connection.php'; // Include your database connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$userID = $_SESSION['user_id'];
$itemID = intval($_POST['item_id'] ?? 0);
$oldVariantID = isset($_POST['old_variant_id']) && $_POST['old_variant_id'] !== '' ? intval($_POST['old_variant_id']) : null;
$newVariantID = isset($_POST['new_variant_id']) && $_POST['new_variant_id'] !== '' ? intval($_POST['new_variant_id']) : null;
$quantity = intval($_POST['quantity'] ?? 0); // Quantity of the item being changed

if ($itemID <= 0 || $quantity <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid item ID or quantity."]);
    exit;
}

try {
    // Use PDO for transactions and better error handling
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $user,
        $password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->beginTransaction();

    // 1. Get the price of the new variant
    $newVariantPrice = null;
    if ($newVariantID !== null) {
        $stmt = $pdo->prepare("SELECT price FROM item_variants WHERE variant_id = ?");
        $stmt->execute([$newVariantID]);
        $variantData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($variantData) {
            $newVariantPrice = $variantData['price'];
        } else {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "New variant not found."]);
            exit;
        }
    } else {
        // If newVariantID is null, get the base item price
        $stmt = $pdo->prepare("SELECT price FROM items WHERE item_id = ?");
        $stmt->execute([$itemID]);
        $itemData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($itemData) {
            $newVariantPrice = $itemData['price'];
        } else {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Item not found."]);
            exit;
        }
    }

    // 2. Check if an item with the new variant already exists in the cart
    $existingNewVariantStmt = $pdo->prepare("SELECT quantity FROM cart WHERE user_id = ? AND item_id = ? AND variant_id " . ($newVariantID !== null ? "= ?" : "IS NULL"));
    $existingNewVariantParams = $newVariantID !== null ? [$userID, $itemID, $newVariantID] : [$userID, $itemID];
    $existingNewVariantStmt->execute($existingNewVariantParams);
    $existingNewVariant = $existingNewVariantStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingNewVariant) {
        // If item with new variant exists, update its quantity
        $updatedQty = $existingNewVariant['quantity'] + $quantity;
        $updateExistingStmt = $pdo->prepare(
            "UPDATE cart SET quantity = ?, price = ? WHERE user_id = ? AND item_id = ? AND variant_id " . ($newVariantID !== null ? "= ?" : "IS NULL")
        );
        $updateExistingParams = $newVariantID !== null ? [$updatedQty, $newVariantPrice, $userID, $itemID, $newVariantID] : [$updatedQty, $newVariantPrice, $userID, $itemID];
        $updateExistingStmt->execute($updateExistingParams);

        // Then, remove the old variant entry
        $deleteOldStmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND item_id = ? AND variant_id " . ($oldVariantID !== null ? "= ?" : "IS NULL"));
        $deleteOldParams = $oldVariantID !== null ? [$userID, $itemID, $oldVariantID] : [$userID, $itemID];
        $deleteOldStmt->execute($deleteOldParams);

    } else {
        // If item with new variant does not exist, just update the current item's variant_id and price
        $updateStmt = $pdo->prepare(
            "UPDATE cart SET variant_id = ?, price = ? WHERE user_id = ? AND item_id = ? AND variant_id " . ($oldVariantID !== null ? "= ?" : "IS NULL")
        );
        $updateParams = [];
        $updateParams[] = $newVariantID;
        $updateParams[] = $newVariantPrice;
        $updateParams[] = $userID;
        $updateParams[] = $itemID;
        if ($oldVariantID !== null) {
            $updateParams[] = $oldVariantID;
        }
        $updateStmt->execute($updateParams);
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Cart variant updated successfully."]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
