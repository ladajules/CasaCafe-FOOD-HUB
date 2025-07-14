<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Connect to the database
    $pdo = new PDO("mysql:host=localhost;dbname=s24100966_LadaMart;charset=utf8", "s24100966_LadaMart", "ciscocisco");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get input values
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Look for the user in the database
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE Username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    //if admin then redirect to dashboard admin_dashboard.html
    if ($username === "Casacafe_admin" && $password === "123") {
        header("Location: admin_dashboard.html");
        exit;
    } 
    
    // Check if user exists and password matches
    if ($user && password_verify($password, $user['Password'])) {
         $_SESSION['UserID'] = $user['UserID']; // store user ID
        $_SESSION['Username'] = $user['Username']; // store username ✅
    
        header("Location: index.php"); // redirect after login
        exit;
    } else {
        echo "Invalid username or password.";
    }
}
?>
