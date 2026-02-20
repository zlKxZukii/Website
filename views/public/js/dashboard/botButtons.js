
const activateButton = document.querySelector("#activate")

activateButton.addEventListener("click", () => {
    activateButton.disabled = true
    location.href = '/bot?activate=true'
})

const deactivateButton = document.querySelector("#deactivate")

deactivateButton.addEventListener("click", () => {
    deactivateButton.disabled = true
    location.href = '/bot?deactivate=true'
})

const state = document.getElementById("state")

if (state.innerText == "true") {
    activateButton.remove()
}
else {
    deactivateButton.remove()
}

state.remove()