<?php
session_start();


if ($_SERVER["REQUEST_METHOD"] == "POST") {
     $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
     $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

     $username = $_POST['username'] ?? '';
     $password = $_POST['password'] ?? '';

     $stmt = $pdo->prepare("SELECT user_id, password, role FROM users WHERE username = :username");
     $stmt->execute([':username' => $username]);
     $user = $stmt->fetch(PDO::FETCH_ASSOC);

     if ($user && password_verify($password, $user['password'])) {
         $_SESSION['user_id'] = $user['user_id'];
         $_SESSION['username'] = $user['username'];
         $_SESSION['role'] = $user['role']; 

         if ($_SESSION['role'] === 'Admin') {
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
