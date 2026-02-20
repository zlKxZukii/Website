let counter = 0

const saveIntervallNames = []

window.addEventListener("load", () => {
    renderIntervall()
})

function renderIntervall() {
    const keys = Object.keys(data)
    keys.sort()
    const headline = document.getElementById("headline")
    for (let index = 0; index < keys.length; index++) {
        headline.innerHTML += renderTemplate(data[keys[index]].intervallName, data[keys[index]].text, data[keys[index]].intervall, data[keys[index]].state)
    }
    headline.innerHTML += ` <div class="box-line">
                                <div class="creation-buttons">
                                    <button onclick="createIntervall()">Hinzufügen</button>
                                    <button onclick="saveIntervall()" id="safeButton">Speichern</button>
                                </div>
                            </div>`
}

function renderTemplate(intervallName, text, intervall, state) {
    return `<div class="box-line" id="${intervallName}">
                <div class="img-tag">
                    <button onclick="deleteIntervall('${intervallName}')">x</button>
                    <img src="./img/intervall/pencil.png" alt="" onclick="editIntervall('${intervallName}')">
                </div>
                <div style="width: 10%;">
                    ${intervallName}
                </div>
                <div style="width: 60%;" id="${intervallName}Text">
                    <p style="width: 80%;" id="${intervallName}ShowText">${text}</p>
                </div>
                <div style="width: 10%;" id="${intervallName}Intervall">
                    <p style="width: 100%;" id="${intervallName}ShowIntervall">${intervall}</p>
                </div>
                <label>
                    <input id="${intervallName}IntervallState" onclick="stateCheck('${intervallName}')" type="checkbox" ${getState(state)} >
                    <div class="toggle"><span></span></div>
                </label>
            </div>`
}

function getState(state) {
    if (state) {
        return "checked"
    }
}

function stateCheck(intervallName) {
    saveIntervallNames.push(intervallName)
}

function saveIntervall() {
    for (let index = 0; index < saveIntervallNames.length; index++) {

        if (!document.getElementById(`${saveIntervallNames[index]}InputText`)) {
            const obj = {
                text: document.getElementById(`${saveIntervallNames[index]}ShowText`).innerText,
                intervall: document.getElementById(`${saveIntervallNames[index]}ShowIntervall`).innerText,
                state: document.getElementById(`${saveIntervallNames[index]}IntervallState`).checked,
                intervallName: saveIntervallNames[index]
            }
            document.cookie = `${saveIntervallNames[index]}=${JSON.stringify(obj)};max-age=1000`
        }
        else {
            const obj = {
                text: document.getElementById(`${saveIntervallNames[index]}InputText`).value,
                intervall: document.getElementById(`${saveIntervallNames[index]}InputIntervall`).value,
                state: document.getElementById(`${saveIntervallNames[index]}IntervallState`).checked,
                intervallName: saveIntervallNames[index]
            }
            document.cookie = `${saveIntervallNames[index]}=${JSON.stringify(obj)};max-age=1000`
        }
    }
    for (let index = 0; index < counter; index++) {
        const intervallName = document.getElementById(`newName${index}`).value
        // falls die nummer nicht gegeben wurde
        let intervallNumber = document.getElementById(`newIntervall${index}`).value
        if (intervallNumber == "") {
            intervallNumber = 300
        }

        const obj = {
            text: document.getElementById(`newText${index}`).value,
            intervall: intervallNumber,
            state: true,
            intervallName: intervallName
        }
        document.cookie = `${intervallName}=${JSON.stringify(obj)};max-age=1000`
    }

    window.location.href = "/data?intervall=true"
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

function deleteIntervall(intervallName) {
    document.getElementById(intervallName).remove()
    window.location.href = `/data?intervall=true&delete=${intervallName}`
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