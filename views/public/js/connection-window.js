const userWindow = document.getElementById("userWindow")
const loginButton = document.getElementById("loginButton")
const loginWindow = document.getElementById("login-window")
const signOutButton = document.getElementById("signout")



if (username.innerText.length > 3) {
    loginButton.remove()
    loginWindow.remove()
    signOutButton.addEventListener("click", () => {
        document.location.href = "/data?sign=signout"
    })
}
else {
    signOutButton.remove()
    userWindow.remove()
}

function toggleLogin() {
    if (loginWindow.style.display == "none") {
        loginWindow.style.display = "flex"
    } else {
        loginWindow.style.display = "none"
    }
}