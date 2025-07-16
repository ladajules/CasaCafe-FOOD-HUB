<?php

$pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart", "s24100966_LadaMart", "ciscocisco");

$sql = "SELECT i.*, v.variant_id, v.variant_name, v.variant_price
        FROM item_table i
        LEFT JOIN item_variants v ON i.item_id = v.item_id";

$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Grouping results
$grouped = [];
foreach ($rows as $row) {
    $id = $row['item_id'];
    
    if (!isset($grouped[$id])) {
        // Copy all item_table columns
        $grouped[$id] = [
            "item_id" => $row["item_id"],
            "item_name" => $row["item_name"],
            "item_category" => $row["item_category"],
            "item_description" => $row["item_description"],
            "item_price" => $row["item_price"],
            "item_image" => $row["item_image"],
            "variants" => []
        ];
    }

    if ($row["variant_id"]) {
        $grouped[$id]["variants"][] = [
            "variant_id" => $row["variant_id"],
            "variant_name" => $row["variant_name"],
            "variant_price" => $row["variant_price"]
        ];
    }
}

header('Content-Type: application/json');
echo json_encode(array_values($grouped));