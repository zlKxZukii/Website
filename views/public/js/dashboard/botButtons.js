
function pushButton(state) {
    const button = document.getElementById(`${state}`)
    button.disabled = true
    location.href = `/dashboard/bot/${state}`
}


const activateButton = document.querySelector("#activate")

const state = document.getElementById("state")

if (state.innerText == "true") {
    document.getElementById("activate").remove()
}
else {
    document.getElementById("deactivate").remove()
}

state.remove()