<?php
session_start();
require 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
     $username = $_POST['username'] ?? '';
     $password = $_POST['password'] ?? '';

     $stmt = $conn->prepare("SELECT user_id, username, password, role FROM users WHERE username = ?");
     $stmt->bind_param("s", $username);
     $stmt->execute();
     $result = $stmt->get_result();
     $user = $result->fetch_assoc();

     if ($user && password_verify($password, $user['password'])) {
         $_SESSION['user_id'] = $user['user_id'];
         $_SESSION['username'] = $user['username'];
         $_SESSION['role'] = $user['role']; 

         if ($user['role'] === 'Admin') {
            header("Location: admin_dashboard.html");
         } else {
            header("Location: index copy.html");
         }
         exit;
    } else {
      header("Location: login.html?error=1");
    }
}
?>
