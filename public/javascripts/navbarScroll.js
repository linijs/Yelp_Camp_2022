document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.getElementById("mainNavbar");

    function checkScroll() {
        let scrollPosition = window.scrollY;

        if (scrollPosition > 50) {
            navbar.classList.add("navbar-scrolled");
            navbar.classList.remove("navbar-dark");
            navbar.classList.add("navbar-light");
        } else {
            navbar.classList.remove("navbar-scrolled");
            navbar.classList.add("navbar-dark");
            navbar.classList.remove("navbar-light");
        }
    }

    window.addEventListener("scroll", checkScroll);
    checkScroll(); // Check on page load
});
