const burgerMenu = document.getElementById("burgerMenu")
const burgerIcon = document.getElementById("burgerIcon")

function burgerMenuSlide() {
    if (burgerMenu.style.transform === "translateX(0%)") {
        burgerMenu.style.transform = "translateX(-100%)"
        burgerMenu.style.boxShadow = "none"
        burgerIcon.style.display = "flex"
    }
    else {
        burgerIcon.style.display = "none"
        burgerMenu.style.boxShadow = "5px 10px 10px #222222, 5px -10px 10px #222222, -5px 10px 10px #222222, -5px -10px 10px #222222"
        burgerMenu.style.transform = "translateX(0%)"
    }
}