<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CASACAFE</title>
    <link rel="icon" href="temp casaLogo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="index.css">
    <link rel="stylesheet" href="content.css">
</head>
<body>
    <?php include 'header.php'; ?>

    <section class="cart" id="cart">
        <div class="content">
            <h1>Your Favorites</h1>
            <section id="wishlistSection" class="pSection"></section>
            
        </div>
    </section>

    <div id="productModal" class="modal hidden">
        <div class="modal-content">
            <span class="close">&times;</span>
            <img id="modalImg" src="" alt="" />
            <h1 id="modalTitle"></h1>
            <span id="modalRate"></span><span id="modalStar">⭐</span>
            <p id="modalDesc"></p>
            <p id="modalPrice"></p>
            <button id="modalCartBtn">Add to cart</button>
        </div>
    </div>


    <div id="popupNotification" class="popup">
        <div class="popup-content">
          <span id="popupCloseBtn" class="close-btn">&times;</span>
          <p id="popupMessage">Message goes here</p>
        </div>
    

    <script src="wishlist.js"></script>
</body>
</html>
