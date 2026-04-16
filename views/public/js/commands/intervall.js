let counter = 0

const saveIntervallNames = []

// abreifen des namens für speichern des intervalls
function stateCheck(intervallName) {
    saveIntervallNames.push(intervallName)
}

async function saveIntervall(button) {
    const btnText = button.innerText;
    const obj = {}
    for (const key of saveIntervallNames) {
        if (!document.getElementById(`${key}InputText`)) {
            Object.assign(obj, {
                [key]: {
                    text: document.getElementById(`${key}ShowText`).innerText,
                    intervall: document.getElementById(`${key}ShowIntervall`).innerText,
                    state: document.getElementById(`${key}IntervallState`).checked,
                    intervallName: key
                }
            })
        }
        else {
            Object.assign(obj, {
                [key]: {
                    text: document.getElementById(`${key}InputText`).value,
                    intervall: document.getElementById(`${key}InputIntervall`).value,
                    state: document.getElementById(`${key}IntervallState`).checked,
                    intervallName: key
                }
            })
        }
    }

    for (let index = 0; index < counter; index++) {
        const intervallName = document.getElementById(`newName${index}`)
        // falls die nummer nicht gegeben wurde
        const intervallText= document.getElementById(`newText${index}`).value
        let intervallNumber = document.getElementById(`newIntervall${index}`).value
        if (intervallNumber == "") {
            intervallNumber = 300
        }
        if (intervallName.value === '') {
            alert("Der Name darf nicht leer sein!")
            intervallName.addEventListener('click', () => {
                intervallName.style.borderColor = '#2bdffe'
            })
            intervallName.style.borderColor = "red";
            return
        }
        document.getElementById(`new${index}`).innerHTML = renderTemplate(intervallName.value, intervallText, intervallNumber, true )
        Object.assign(
            obj, {
            [intervallName.value]: {
                text: intervallText,
                intervall: intervallNumber,
                state: true,
                intervallName: intervallName.value
            }
        })
    }
    await fetchIntervall(obj, button, btnText)
    // window.location.href = "/intervall/save"
}

async function fetchIntervall(data, saveBtn, btnText) {
    try {
        const response = await fetch('/intervall/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(data)
        })
        if (response.ok) {

            saveBtn.innerText = "Erfolgreich gespeichert.";
            saveBtn.style.animation = "rainbow 5s"
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.style.color = "white"
                saveBtn.innerText = btnText;
                saveBtn.style.animation = null;
            }, 5000);
        }
        else {
            saveBtn.disabled = true;
            saveBtn.style.color = "red",
                saveBtn.innerText = "FEHLER "
        }
    } catch (error) {
        saveBtn.disabled = true;
        saveBtn.color = "red",
            saveBtn.innerText = "FEHLER " + error
    }
}

function editIntervall(intervallName) {
    saveIntervallNames.push(intervallName)
    const showText = document.getElementById(`${intervallName}ShowText`)
    const showIntervall = document.getElementById(`${intervallName}ShowIntervall`)
    showText.remove()
    showIntervall.remove()

    document.getElementById(`${intervallName}Text`).innerHTML += `<input id="${intervallName}InputText" style="width: 60%;"  type="text" placeholder="Hier kommt der Text rein, der nach dem Intervall ausgegeben werden soll." value="${showText.innerText}">`
    document.getElementById(`${intervallName}Intervall`).innerHTML += `<input min="0" id="${intervallName}InputIntervall" style="width: 100%;" type="number" placeholder="Dauer des Intervalls" value="${showIntervall.innerText}">`
}

async function deleteIntervall(intervallName) {
    const response = await fetch('/intervall/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Action-Type': 'Save-Follower-Settings'
        },
        body: JSON.stringify({intervallName})
    })
    if (response.ok) {
        document.getElementById(intervallName).remove()
    }
}

function createIntervall() {
    document.getElementById("headline").innerHTML += createIntervallTemplate(counter)
    counter = counter + 1
}

function createIntervallTemplate(counter) {
    return `<div class="new-edit" id="new${counter}">
                <input type="text" id="newName${counter}" placeholder="Name des Intervalls" autocomplete="off">
                <input style="width: 60%;" type="text" id="newText${counter}"
                    placeholder="Hier kommt der Text rein, der nach dem Intervall ausgegeben werden soll." autocomplete="off">
                <input type="number" id="newIntervall${counter}" placeholder="Dauer des Intervalls" autocomplete="off">
            </div>`
}