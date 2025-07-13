<?php
session_start();

$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $username = $_POST['username'] ?? '';
    $passwordInput = $_POST['password'] ?? '';

    // Fetch full row including UserID and Password
    $stmt = $pdo->prepare("SELECT UserID, Password FROM login WHERE Username = :username");
    $stmt->execute([':username' => $username]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && password_verify($passwordInput, $row['Password'])) {
        $_SESSION['UserID'] = $row['UserID']; // ✅ Set after fetching the row
        header("Location: index copy.html");
        exit;
    } else {
        header("Location: login.html?error=1");
        exit;
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
