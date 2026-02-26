const renderWindow = document.getElementById("cookieDiv")
let owl = document.getElementById("cookieOwl")

if (document.cookie.includes("cookie")) {
    openCookieOwl()
}
else {
    openCookieWindow()
}

function closeButton() {
    let banner = document.getElementById("cookieWindow")
    if (document.cookie.includes("cookie")) {
        banner.remove()
        openCookieOwl()
    }
    else {
        window.location.href = '/data?nocookie=declined'
    }
}

function openCookieWindow() {
    openCookieBanner()
}

function acceptButton() {
    let banner = document.getElementById("cookieWindow")
    document.cookie = "cookie=accepted; Max-Age=1209600; Path=/"
    banner.remove()
    openCookieOwl()
}

function openCookieBanner() {
    renderWindow.innerHTML = `<div id="cookieWindow" class="cookie-window">
    <div class="cookie-box">
        <div class="closeButton" onclick="acceptButton()">
            <button>X</button>
        </div>
        <div class="cookie-text">
            <h2>Disclaimer</h2>
            <p>Weitere Details zur Funktion unserer Cookies findest du im <a href="/dataSecure">Datenschutz</a>.</p>
            <p>Speicherung erfolgt für 14 Tage oder endet automatisch, sobald du dich abmeldest.</p>
        </div>
        <div class="cookie-button">
            <button style="border: #2BD6F1 solid; margin-bottom:20px;" id="accept" onclick="acceptButton()">Ich habe verstanden</button>
        </div>
    </div>
</div>`
}

function openCookieOwl() {
    renderWindow.innerHTML = `<img id="cookieOwl" onclick="openCookieWindow()" src="../img/cookie_owl.png" alt="">`
}