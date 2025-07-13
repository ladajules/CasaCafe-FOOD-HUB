<?php 
header("Content-Type: application/json");

$host = "localhost";
$dbname = "s24100966_LadaMart";
$user = "s24100966_LadaMart";
$password = "ciscocisco";

try {
    $host = "localhost";
    $dbname = "s24100966_LadaMart";       
    $user = "s24100966_LadaMart";      
    $password = "ciscocisco";     

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Input from login form
    $username = "admin";
    $passwordInput = "admin123";

    $stmt = $pdo->prepare("SELECT Password FROM login WHERE Username = :username");
    $stmt->execute([':username' => $username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result && password_verify($passwordInput, $result['Password'])) {
        echo json_encode(["success" => "Login successful"]);
    } else {
        echo json_encode(["error" => "Invalid username or password"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Something went wrong: " . $e->getMessage()]);
}
?>
