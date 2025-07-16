<?php
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Raw POST: " . json_encode($_POST));

    file_put_contents("debug_post.txt", print_r($_POST, true));

    $userID = $_POST['UserID'] ?? '';
    $newUsername = $_POST['Username'] ?? '';

    error_log("UserID: " . $userID);
    error_log("Username: " . $newUsername);

    if (!empty($userID) && !empty($newUsername)) {
        $stmt = $conn->prepare("UPDATE login SET Username = ? WHERE UserID = ?");
        $stmt->bind_param("si", $newUsername, $userID);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Missing fields"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
}
?>
