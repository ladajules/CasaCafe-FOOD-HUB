<?php
require_once 'db_connection.php';
session_start();

if (!isset($_GET['token']) || empty($_GET['token'])) {
    header("Location: index.php");
    exit;
}

$token = trim($_GET['token']);

$stmt = $conn->prepare("
    SELECT user_id, username, reset_token_expires
    FROM users
    WHERE reset_token = ?
    LIMIT 1
");

$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    header("Location: index.php");
    exit;
}

$user = $result->fetch_assoc();

if (strtotime($user['reset_token_expires']) < time()) {
    header("Location: index.php");
}

$stmt->close();

$username = $user['username'];
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset</title>
    <link rel="icon" href="temp casaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="reset.css">
</head>

<header>
    <input type="checkbox" name="" id="toggler">
    <label for="toggler" class="fas fa-bars"></label>
    <a href="index.php" class="logo"><img src="temp casaLogo.png"><span></span></a>

    <nav class="nav-bar">
        <a href="index.php">home</a>
    </nav>



</header>

<body style="background-color: white">

    <div id="resetContainer">

        <form action="reset_user.php" class="form" method="POST">
            <h2 id="title">Reset Password</h2>
            <div>
                <p id="email">
                    You are resetting the password for
                    <strong><?php echo htmlspecialchars($username); ?></strong>.
                </p>
            </div>

            <div>
                <label for="password" class="details">Password:</label>
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($_GET['token']); ?>">
                <input type="password" id="password" name="password" required autocapitalize="none"><br><br>
            </div>
            <input type="submit" value="Reset" id="reset">


            <p id="register">Don't have an account? <a href="register.php">Register here</a></p>
        </form>
    </div>


     <div id="errorModal" style="display: none; position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
    background-color: white; padding: 20px; border: 2px solid #f00; z-index: 1000;">
        <p id="errorText" style="color: red;"></p>
        <button onclick="document.getElementById('errorModal').style.display='none'">Close</button>
    </div>


    <script>
        window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('error')) {
                const error = urlParams.get('error');
                document.getElementById('errorText').textContent = decodeURIComponent(error.replace(/\+/g, ' '));
                document.getElementById('errorModal').style.display = 'block';
            }
        }
    </script>
</body>

</html>