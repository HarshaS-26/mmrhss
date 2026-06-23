document.addEventListener("DOMContentLoaded", function () {
    fetch("includes/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        });

    fetch("includes/footer.html")
        .then(response => response.text())
        .then(data => {
            const footer = document.getElementById("footer");
            if (footer) footer.innerHTML = data;
        });
});