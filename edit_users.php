<?php
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Raw POST: " . json_encode($_POST));

    $newUsername = $_POST['username'] ?? '';
    $user_id = $_POST['user_id'] ?? '';

    error_log("user_id: " . $userID);
    error_log("username: " . $newUsername);

    if (!empty($user_id) && !empty($newUsername)) {
        $stmt = $conn->prepare("UPDATE users SET username = ? WHERE user_id = ?");
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
