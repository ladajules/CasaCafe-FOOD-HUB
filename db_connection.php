<?php
$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}
?>
