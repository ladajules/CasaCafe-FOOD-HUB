<?php
session_start();
header('Content-Type: application/json');
require 'db_connection.php';

if (!isset($_SESSION['UserID'])) {
    echo json_encode(['username' => 'Guest']);
    exit;
}

$userID = $_SESSION['UserID'];
$sql = "SELECT Username FROM login WHERE UserID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();

$username = "Guest";
if ($row = $result->fetch_assoc()) {
    $username = htmlspecialchars($row['Username']);
}

echo json_encode(['Username' => $username]);

?>