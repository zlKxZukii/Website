// Updaten der Commands

let counter = 0

async function initSave() {
    const saveBtn = document.getElementById("safeButton");
    const btnText = saveBtn.innerText
    saveBtn.disabled = true;
    saveBtn.innerText = "Speichert..."
    saveBtn.style.color = "grey"
    await saveVals(saveBtn, btnText)
}

async function saveVals(saveBtn, btnText) {
    const keys = []
    const divs = document.querySelectorAll('.default-commands');
    divs.forEach(element => {
        keys.push(element.id)
    });
    const fetchData = {};
    for (let index = 0; index < keys.length; index++) {
        Object.assign(fetchData, {
            [keys[index]]: {
                category: keys[index],
                response_text: document.getElementById([keys[index]] + "Link").value,
                cooldown: Number(document.getElementById([keys[index]] + "Cooldown").value),
                delay: Number(document.getElementById([keys[index]] + "Delay").value),
                state: document.getElementById([keys[index]] + "LinkState").checked,
                triggers: document.getElementById([keys[index]] + "Trigger").innerText,
                stateTitle: {
                    anybody: document.getElementById([keys[index]] + "Anybody").checked,
                    broadcaster: document.getElementById([keys[index]] + "Broadcaster").checked,
                    vip: document.getElementById([keys[index]] + "Vip").checked,
                    subscriber: document.getElementById([keys[index]] + "Subscriber").checked,
                    moderator: document.getElementById([keys[index]] + "Moderator").checked
                }
            }
        })
        
        document.getElementById([keys[index]] + "LinkId").innerText = document.getElementById([keys[index]] + "Link").value
        if (document.getElementById(`${keys[index] + 'Link'}`).value === "") {
            Object.assign(fetchData[keys[index]], { response_text: document.getElementById([keys[index]] + "LinkId").innerText })
        }
    };
console.log(keys)
    try {
        const response = await fetch('/customcommands/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(fetchData)
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

async function deleteCommand(key) {
    const id = document.getElementById(`${key}complete`)

    try {
        const response = await fetch("/customcommands/delete", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify({ category: key })
        })
        if (response.ok) {
            id.remove()
        }
    } catch (error) {
        console.log("Fehler beim Löschen des Custom Commands: " + error)
    }
}

function checkTrigger(saveArray, index) {
    let trigger = document.getElementById(`${saveArray[2]}${index}`).value
    const triggerArray = trigger.split(' ')
    console.log(trigger)
    console.log(triggerArray)
    for (let index = 0; index < triggerArray.length; index++) {
        if (!triggerArray[index].includes("!")) {
            triggerArray[index] = "!" + triggerArray[index]
        }
    }

    console.log(triggerArray)
    return { triggers: triggerArray }
}

// Erstellen neuer Commands

function registerCommand() {
    const windowContainer = document.getElementById("customWindow");
    windowContainer.insertAdjacentHTML('beforeend', creationWindow(counter));
    counter++;
}

async function createCommand(key, button) {
    const saveArray = ['newDescription', 'newValue', 'newTrigger'];
    const category = document.getElementById(`${saveArray[0]}${key}`);
    const responseText = document.getElementById(`${saveArray[1]}${key}`);
    const trigger = document.getElementById(`${saveArray[2]}${key}`);

    const triggerArr = trigger.value
        .split(" ")
        .filter(word => word !== "")
        .map(word => {
            return word.startsWith("!") ? word : `!${word}`
        });

    const fetchData = {
        category: category.value,
        responseText: responseText.value,
        trigger: triggerArr
    };
    button.disabled = true;
    button.innerText = "Speichert...";
    button.style.color = "grey";
    await pushDB(fetchData, key, button)

}

async function pushDB(fetchData, key, saveBtn) {
    const createObj = {
        [fetchData.category]: {
            response_text: fetchData.responseText,
            cooldown: 0,
            delay: 0,
            state: false,
            triggers: fetchData.trigger,
            stateTitle: {
                anybody: false,
                broadcaster: false,
                vip: false,
                subscriber: false,
                moderator: false
            }
        }
    }

    try {
        const response = await fetch('/customcommands/create', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(fetchData)
        })

        if (response.ok) {
            saveBtn.innerText = "Erfolgreich gespeichert.";
            saveBtn.style.animation = "rainbow 5s"
            setTimeout(() => {
                Object.assign(customCommands, createObj)
                document.getElementById("customWindow").innerHTML += getTemplate(fetchData.category)
                document.getElementById('creationWindow' + key).remove()
            }, 5000);
        }
        else {
            alert("Fehler beim Speichern");
            saveBtn.disabled = false;
            saveBtn.innerText = "Fehler";
        }
    } catch (error) {
        console.log("Fehler beim erstellen des Commands: " + error)
        saveBtn.disabled = false;
        saveBtn.innerText = btnText;
    }

}

// Löschen aller Zeilen
function deleteValues() {
    for (let index = 0; index < counter; index++) {
        const newDescription = document.getElementById(`newDescription${index}`).value = ""
        const newValue = document.getElementById(`newValue${index}`).value = ""
        const newTrigger = document.getElementById(`newTrigger${index}`).value = ""
    }
}