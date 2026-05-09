<?php
echo "Script loaded.<br>";
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

    // Get form input values
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $number = $_POST['number'] ?? '';
    $message = $_POST['message'] ?? '';

    // Optional: simple validation
    if (empty($name) || empty($email) || empty($message)) {
        echo "Please fill out all required fields.";
        exit;
    }

    // Prepare and execute insert statement
    $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, number, message) 
                           VALUES (:name, :email, :number, :message)");

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':number' => $number,
        ':message' => $message
    ]);

    echo "Message sent successfully!";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
