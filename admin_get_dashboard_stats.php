<?php
require 'db_connection.php';
header('Content-Type: application/json');

// PENDING ORDERS
$pending = $conn->query("SELECT COUNT(DISTINCT CONCAT(user_id, '|', purchase_date)) AS total FROM purchases WHERE status = 'Pending'");
$pending_count = $pending->fetch_assoc()['total'] ?? 0;

// COMPLETED ORDERS
$completed = $conn->query("SELECT COUNT(DISTINCT CONCAT(user_id, '|', purchase_date)) AS total FROM purchases WHERE status = 'Completed'");
$completed_count = $completed->fetch_assoc()['total'] ?? 0;

// TOTAL ORDERS 
$total = $conn->query("SELECT COUNT(DISTINCT CONCAT(user_id, '|', purchase_date)) AS total FROM purchases");
$total_count = $total->fetch_assoc()['total'] ?? 0;

//TOTAL PRODUCTS 
$products = $conn->query("SELECT COUNT(*) AS total FROM item_table");
$products_count = $products->fetch_assoc()['total'] ?? 0;

// TOTAL CUSTOMERS 
$customers = $conn->query("SELECT COUNT(*) AS total FROM users WHERE role = 'User'");
$customers_count = $customers->fetch_assoc()['total'] ?? 0;

echo json_encode([
  "pending_orders" => $pending_count,
  "completed_orders" => $completed_count,
  "total_orders" => $total_count,
  "total_products" => $products_count,
  "total_customers" => $customers_count
]);
?>
