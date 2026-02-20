const burgerMenu = document.getElementById("burgerMenu")
const burgerIcon = document.getElementById("burgerIcon")

function burgerMenuSlide() {
    if(burgerMenu.style.transform === "translateX(0%)"){
        burgerMenu.style.transform ="translateX(-100%)"
        burgerIcon.style.display = "flex"
    }
    else{
        burgerIcon.style.display = "none"
        burgerMenu.style.transform ="translateX(0%)"
    }
}