function safeState() {
    for (let index = 0; index < tagArray.length; index++) {
        let val = document.getElementById(tagArray[index])
        document.cookie = `${tagArray[index]}=${val.checked} ;max-age= ${1000}`
    }
    window.location.href = "/security/save"
}

function fadeIt(title) {
    document.getElementById(`${title}Slide`).classList.toggle("fade-open")
}