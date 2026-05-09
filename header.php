<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']);
?>
<header>
    <input type="checkbox" id="toggler">
    <label for="toggler" class="fas fa-bars"></label>

    <a href="index.php" class="logo">
        <img src="temp casaLogo.png">
    </a>

    <?php if ($showSearch ?? false): ?>
            <form id="searchForm">
                <input type="search" id="searchBar" placeholder="Search...">
                <button type="submit" class="srchButton">🔍</button>
            </form>
        <?php endif; ?>

    <nav class="nav-bar">

        <a href="<?= $isLoggedIn ? 'wishlist.php' : 'login.php' ?>" id="navWish">
            <i class="fa-regular fa-heart wishlist-icon"></i>
        </a>

        <a href="<?= $isLoggedIn ? 'cart.php' : 'login.php' ?>" id="navCart">Cart</a>

        <a href="index.php#home">home</a>
        <a href="index.php#about-shop">about us</a>
        <a href="product.php">Menu</a>

        <?php if ($isLoggedIn): ?>

            <div class="dropdown" id="profileDropdown">
                <div id="dropdownToggle">
                    <i class="fas fa-user-circle"></i>
                    <i class="fas fa-chevron-down" id="dropdownArrow"></i>
                </div>

                <div class="dropdown-menu" id="dropdownMenu">
                    <a href="profile.php" style="color:black;">My Profile</a>
                    <a href="#" id="logoutBtn" style="color:black;">Log out</a>
                </div>
            </div>
            <script src="dropdown.js"></script>
        <?php else: ?>

            <a href="login.php" id="navLog">login</a>
            <a href="register.php" id="navReg">Sign Up</a>

        <?php endif; ?>

    </nav>
</header>