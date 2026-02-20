let cookiedocs = document.cookie
let counter = 0

//Speichern der Commands

window.addEventListener("load", () => {
    const customCommandKey = Object.keys(customCommands)

    for (let keyI = 0; keyI < customCommandKey.length; keyI++) {
        document.getElementById("customWindow").innerHTML += getTemplate(customCommandKey[keyI])
    }
})

function initSave() {
    checkExistingFields()
    for (let index = 0; index < counter; index++) {
        let newDescription = document.getElementById(`newDescription${index}`)
        let newValue = document.getElementById(`newValue${index}`)
        let newTrigger = document.getElementById(`newTrigger${index}`)
        checkNewFields(newDescription, newValue, newTrigger)
    }
    if (document.getElementById("dontAllow") == null) {
        document.location.href = "/customdata"
    }
}

function checkExistingFields() {
    const existingTags = []

    const getExistingTags = document.querySelectorAll(".default-commands")
    getExistingTags.forEach(div => {
        existingTags.push(div.id)
    });
    for (let index = 0; index < existingTags.length; index++) {
        let sendingObject = { [existingTags[index]]: {} }
        Object.assign(sendingObject[existingTags[index]], {
            value: document.querySelector("#" + existingTags[index] + "LinkId").innerText,
            cooldown: Number(document.querySelector("#" + existingTags[index] + "Cooldown").value),
            delay: Number(document.querySelector("#" + existingTags[index] + "Delay").value),
            state: document.querySelector("#" + existingTags[index] + "LinkState").checked,
            stateTitle: {
                anybody: document.querySelector("#" + existingTags[index] + "anybody").checked,
                broadcaster: document.querySelector("#" + existingTags[index] + "broadcaster").checked,
                moderator: document.querySelector("#" + existingTags[index] + "moderator").checked,
                vip: document.querySelector("#" + existingTags[index] + "vip").checked,
                subscriber: document.querySelector("#" + existingTags[index] + "subscriber").checked
            },
            trigger: document.querySelector("#" + existingTags[index] + "Trigger").innerText
        })
        if (document.querySelector("#" + existingTags[index] + "Link").value != "") {
            Object.assign(sendingObject[existingTags[index]], { value: document.querySelector("#" + existingTags[index] + "Link").value })
        }
        document.cookie = `${existingTags[index]}=${JSON.stringify(sendingObject[existingTags[index]])};max-age=1000000`
    }

}

function checkNewFields(newDescription, newValue, newTrigger) {

    if (newDescription.value.length == 0) {
        newDescription.addEventListener("click", () => {
            newDescription.style.borderColor = "#2bdffe"
        })
        newDescription.style.borderColor = "red"
        document.getElementById("error-div").innerHTML = "<p class='error-text' id='dontAllow'>Bitte alles beachten</p>"
    }
    else if (newValue.value.length > 0) {
        if (document.getElementById("dontAllow")) {
            document.getElementById("dontAllow").remove()
        }
    }

    if (newValue.value.length == 0) {
        newValue.addEventListener("click", () => {
            newValue.style.borderColor = "#2bdffe"
        })
        newValue.style.borderColor = "red"
        document.getElementById("error-div").innerHTML = "<p class='error-text' id='dontAllow'>Bitte alles beachten</p>"
    }
    else if (newValue.value.length > 0) {
        if (document.getElementById("dontAllow")) {
            document.getElementById("dontAllow").remove()
        }
    }

    if (newTrigger.value.length == 0) {
        newTrigger.addEventListener("click", () => {
            newTrigger.style.borderColor = "#2bdffe"
        })
        newTrigger.style.borderColor = "red"
        document.getElementById("error-div").innerHTML = "<p class='error-text' id='dontAllow'>Bitte alles beachten</p>"
    }
    else if (newValue.value.length > 0) {
        if (document.getElementById("dontAllow")) {
            document.getElementById("dontAllow").remove()
        }
    }


    if (newTrigger.value.length > 0 && newValue.value.length > 0 && newDescription.value.length > 0) {
        let newDescriptionSaved = ""
        for (let index = 0; index < newDescription.value.length; index++) {
            if (newDescription.value[index] != " ") {
                console.log(newDescriptionSaved)
                newDescriptionSaved += newDescription.value[index]
            }
        }
        saveValues(newDescriptionSaved, newValue, newTrigger)
    }
}



function saveValues(newDescription, newValue, newTrigger) {
    let newTriggerArray = []
    if (newTrigger.value) {
        let arrStr = "!"
        for (let index = 0; index < newTrigger.value.length; index++) {
            if (newTrigger.value[index] != " ") {
                let letter = newTrigger.value[index].toLowerCase()
                arrStr = arrStr.concat(letter)
            }
            else {
                newTriggerArray.push(arrStr)
                arrStr = "!"
            }
        }
        if (arrStr != "!") {
            newTriggerArray.push(arrStr)
            arrStr = "!"
        }
    }
    let cookieObject = {
        value: newValue.value,
        trigger: newTriggerArray
    }
    document.cookie = `${newDescription}=${JSON.stringify(cookieObject)} ;max-age=100000`
}

// Erstellen neuer Commands

function createCommand() {
    document.getElementById("customWindow").innerHTML += creationWindow(counter)
    document.getElementById(`newDescription${counter}`).addEventListener("keydown", function (e) {
        if (e.key === " " || e.code === "Space" || e.keyCode === 32) {
            alert("Bitte keine Leerzeichen eingeben")
            this.style.borderColor = "red"
            this.addEventListener("click", () => {
                this.style.borderColor = "#2bdffe;"
            })
        }
    })
    counter++
}

// Löschen aller Zeilen
function deleteValues() {
    for (let index = 0; index < counter; index++) {
        let newDescription = document.getElementById(`newDescription${index}`)
        let newValue = document.getElementById(`newValue${index}`)
        let newTrigger = document.getElementById(`newTrigger${index}`)
        newDescription.value = ""
        newValue.value = ""
        newTrigger.value = ""
    }
}