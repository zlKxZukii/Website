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
            <h2>Diese Website nutzt Cookies</h2>
            <p>Weitere Details zur Funktion unserer Cookies findest du im <a href="/dataSecure">Datenschutz</a>.</p>
            <p>Speicherung erfolgt für 14 Tage oder endet automatisch, sobald du dich abmeldest.</p>
            <p>Falls du die Cookies nicht akzeptierst, werden diese vollständig gelöscht. Danach wirst du zu einer
                alternativen Seite weitergeleitet.</p>
        </div>
        <div class="cookie-button">
            <button id="accept" onclick="acceptButton()">Annehmen</button>
            <button id="decline" onclick="acceptButton()">Ablehnen</button>
        </div>
    </div>
</div>`
}

function openCookieOwl() {
    renderWindow.innerHTML = `<img id="cookieOwl" onclick="openCookieWindow()" src="../img/cookie_owl.png" alt="">`
}