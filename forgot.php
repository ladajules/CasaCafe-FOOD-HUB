<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forgot Password | CasaCafe</title>
    <link rel="icon" href="temp casaLogo.png" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
    <link rel="stylesheet" href="index.css" />
    <style>
        body {
            margin-top: 88px;
            font-family: Arial, sans-serif;
            background: #f7f7f7;
            color: #333;
        }
        .forgot-page {
            max-width: 920px;
            margin: 0 auto 40px;
            padding: 0 20px;
        }
        .forgot-header {
            text-align: center;
            margin: 30px auto 24px;
            max-width: 760px;
        }
        .forgot-header h1 {
            margin: 0;
            font-size: 2rem;
        }
        .forgot-header p {
            margin: 14px auto 0;
            color: #555;
            line-height: 1.7;
        }
        .form-frame {
            background: #fff;
            border-radius: 12px;
            border: 1px solid #ddd;
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .form-frame iframe {
            width: 100%;
            min-height: 840px;
            border: none;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 18px 0 0;
            color: #333;
            text-decoration: none;
            font-weight: 600;
        }
        .info-box {
            margin-top: 24px;
            background: #fff;
            border-radius: 12px;
            padding: 22px;
            border: 1px solid #e5e5e5;
            color: #555;
            line-height: 1.7;
        }
        .info-box h2 {
            margin-top: 0;
            font-size: 1.2rem;
            color: #222;
        }
        .info-box ul {
            margin: 12px 0 0;
            padding-left: 20px;
        }
        .info-box li {
            margin-bottom: 10px;
        }
        @media (max-width: 640px) {
            .forgot-page {
                margin: 0 auto 20px;
                padding: 0 14px;
            }
            .forgot-header h1 {
                font-size: 1.7rem;
            }
        }
    </style>
</head>

<body>
    <header>
        <input type="checkbox" name="" id="toggler">
        <label for="toggler" class="fas fa-bars"></label>
        <a href="index.php" class="logo"><img src="temp casaLogo.png"><span></span></a>

        <nav class="nav-bar">
            <a href="index.php" id="navHome">home</a>
        </nav>
    </header>

    <main class="forgot-page">
        <section class="forgot-header">
            <h1>Forgot Password</h1>
            <p>Please verify your details below so we can confirm your account and send password reset instructions safely. Use the embedded Google Form to submit your registered email, full name, and verification information.</p>
        </section>

        <div class="form-frame">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSclx47O5BV8cJB_4IZMaOWmReHied8gG_1YENRyj0ioLwsmUw/viewform?usp=publish-editor" title="Forgot Password Verification Form">Loading…</iframe>
        </div>

        <a href="login.php" class="back-link"><i class="fas fa-arrow-left"></i>Return to Login</a>

        <section class="info-box">
            <h2>How this works</h2>
            <ul>
                <li>Submit the requested account verification details through the embedded Google Form.</li>
                <li>Our support team will verify your information before resetting your password.</li>
                <li>Use the email address registered with your CasaCafe account to speed up verification.</li>
            </ul>
        </section>
    </main>

</body>
</html>