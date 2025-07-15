<?php
session_start();

$error_message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
     // Connect to the database
     $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
     $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

     // Get input values
     $username = $_POST['username'] ?? '';
     $password = $_POST['password'] ?? '';

     // Look for the user in the database
     $stmt = $pdo->prepare("SELECT UserID, Password, role FROM login WHERE Username = :username");
     $stmt->execute([':username' => $username]);
     $user = $stmt->fetch(PDO::FETCH_ASSOC);

     if ($user && password_verify($password, $user['Password'])) {
         // Store session info
         $_SESSION['UserID'] = $user['UserID'];
         $_SESSION['Username'] = $user['Username'];
         $_SESSION['role'] = $user['role']; 

         // Redirect based on role
         if ($_SESSION['role'] === 'Admin') {
            header("Location: admin_dashboard.html");
         } else {
            header("Location: index copy.html");
         }
         exit;
    } else {
         echo "Error: " . $e->getMessage();
    }
}
?>
