<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "Not logged in.";
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $userID = $_SESSION['user_id'];
    $itemID = intval($_POST['item_id'] ?? 0);

    if ($itemID <= 0) {
        echo "Invalid item ID.";
        exit;
    }

    try {
        $pdo = new PDO(
            "mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8",
            "s24100966_LadaMart",
            "ciscocisco"
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


        $checkStmt = $pdo->prepare("SELECT favorite_id FROM favorites WHERE user_id = ? AND item_id = ?");
        $checkStmt->execute([$userID, $itemID]);

        if ($checkStmt->fetch()) {
            echo "Item already in favorites.";
            exit;
        }

        $insertStmt = $pdo->prepare("INSERT INTO favorites (user_id, item_id) VALUES (?, ?)");
        $insertStmt->execute([$userID, $itemID]);

        echo "Item added to favorites successfully.";

    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage();
    }
}
?>
