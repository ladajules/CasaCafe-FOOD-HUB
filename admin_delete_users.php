<?php
require 'db_connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userID = $_POST['UserID'] ?? '';

    if (!empty($userID)) {
        $stmt = $conn->prepare("DELETE FROM login WHERE UserID = ?");
        $stmt->bind_param("i", $userID);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Missing UserID"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
}
?>