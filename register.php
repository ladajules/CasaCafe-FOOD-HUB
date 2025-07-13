<?php
session_start();

$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

try {
    $$host = "localhost";
    $dbname = "s24100966_LadaMart";       
    $user = "s24100966_LadaMart";      
    $password = "ciscocisco";     

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $username = $_POST['username'] ?? '';
    $plainPassword = $_POST['password'] ?? '';

    if (!$username || !$plainPassword) {
        echo "Please fill in both fields.";
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM login WHERE Username = :username");
    $stmt->execute([':username' => $username]);

    if ($stmt->fetch()) {
        echo "Username already taken.";
    } else {
        $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);
        $insert = $pdo->prepare("INSERT INTO login (Username, Password) VALUES (:username, :password)");
        $insert->execute([':username' => $username, ':password' => $hashedPassword]);

        $_SESSION['registered'] = true;
        header("Location: login.html");
        exit;
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}