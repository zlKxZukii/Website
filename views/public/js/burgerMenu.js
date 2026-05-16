const burgerMenu = document.getElementById("burgerMenu")
const burgerIcon = document.getElementById("burgerIcon")
let iconVar = "";

function burgerMenuSlide(icon) {
    if (icon != undefined){
        iconVar = icon
    }
    if (burgerMenu.style.transform === "translateX(0%)") {
        burgerMenu.style.transform = "translateX(-100%)"
        burgerMenu.style.boxShadow = "none"
        iconVar.style.display = "flex"
    }
    else {
        iconVar.style.display = "none"
        burgerMenu.style.boxShadow = "5px 10px 10px #222222, 5px -10px 10px #222222, -5px 10px 10px #222222, -5px -10px 10px #222222"
        burgerMenu.style.transform = "translateX(0%)"
    }
}