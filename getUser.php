<?php
require 'db_connection.php';
session_start();

if (!isset($_SESSION['UserID'])) {
    echo json_encode([
        "success" => false,
        "error" => "Guest users are not allowed to access this page"
    ]);
    exit();
}

$userID = $_SESSION['UserID'];

$stmt = $conn->prepare("SELECT UserID, Username FROM login WHERE UserID = ?");
$stmt->bind_param("i", $userID);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        echo json_encode([
            "success" => true,
            "userID" => $row['UserID'],
            "username" => $row['Username']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "User not found"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "error" => "Query failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
