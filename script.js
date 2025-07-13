document.getElementById("shopBtn").addEventListener("click", function(event) {
    document.getElementById("popup").style.display = "block";
});

document.getElementById("closePopup").addEventListener("click", function() {
    document.getElementById("popup").style.display = "none";
});


fetch('check_session.php')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      document.getElementById('navLog').style.display = 'none';
      document.getElementById('navReg').style.display = 'none';
    }
  });
  

  fetch('logout.php')
  .then(() => location.reload());
