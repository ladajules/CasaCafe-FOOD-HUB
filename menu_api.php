<?php

$pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart", "s24100966_LadaMart", "ciscocisco");

$sql = "SELECT 
            i.item_id,
            i.name AS item_name,
            i.category,
            i.description,
            i.image_url,
            i.price AS item_price,
            v.variant_id,
            v.name AS variant_name,
            v.price AS variant_price
        FROM items i
        LEFT JOIN item_variants v ON i.item_id = v.item_id";


$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Grouping results
$grouped = [];
foreach ($rows as $row) {
    $id = $row['item_id'];
    
    if (!isset($grouped[$id])) {
        $grouped[$id] = [
            "item_id" => $row["item_id"],
            "item_name" => $row["item_name"],
            "item_category" => $row["category"],
            "item_description" => $row["description"],
            "item_price" => $row["item_price"],
            "item_image" => $row["image_url"],
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