<?php
session_start();
header('Content-Type: application/json');
echo json_encode([
    "UserID" => $_SESSION['UserID'] ?? null
]);
?>