<?php
require 'db_connection.php';
session_start();

$debug = [];

if (!isset($_SESSION['UserID'])) {
    echo json_encode([
        "success" => false,
        "error" => "Guest users are not allowed to access this page"
    ]);
    exit();
}

$userID = $_SESSION['UserID'];
$debug['session'] = $_SESSION;

$stmt = $conn->prepare("SELECT UserID, Username FROM login WHERE UserID = ?");
$stmt->bind_param("i", $userID);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        echo json_encode([
            "success" => true,
            "userID" => $row['UserID'],
            "username" => $row['Username']
        ]);
    } else {
        $debug['error'] = "User not found with ID $userID";
        file_put_contents("debug_getuser.txt", print_r($debug, true));
        echo json_encode(["success" => false, "error" => "User not found"]);
    }
} else {
    $debug['error'] = "Query failed: " . $stmt->error;
    file_put_contents("debug_getuser.txt", print_r($debug, true));
    echo json_encode(["success" => false, "error" => "Query error"]);
}

$stmt->close();
$conn->close();
?>
