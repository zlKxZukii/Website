async function readValues() {
    const saveBtn = document.getElementById("safeButton")
    const btnText = saveBtn.innerText
    const DBKeys = Object.keys(data)
    const fetchData = {}
    saveBtn.disabled = true
    saveBtn.style.color = "grey"
    saveBtn.innerText = "Speichert..."
    for (let index = 0; index < DBKeys.length; index++) {
        // social Media
        if (socialArray.includes(DBKeys[index])) {
            Object.assign(fetchData, {
                [DBKeys[index]]: {
                    state: document.getElementById(DBKeys[index] + "State").checked,
                    value: document.getElementById(DBKeys[index] + "Link").value,
                    stateTitle: {
                        anybody: document.getElementById(DBKeys[index] + "Anybody").checked,
                        subscriber: document.getElementById(DBKeys[index] + "Subscriber").checked,
                        vip: document.getElementById(DBKeys[index] + "Vip").checked,
                        moderator: document.getElementById(DBKeys[index] + "Moderator").checked,
                        broadcaster: document.getElementById(DBKeys[index] + "Broadcaster").checked
                    },
                    cooldown: Number(document.getElementById(DBKeys[index] + "Cooldown").value),
                    delay: Number(document.getElementById(DBKeys[index] + "Delay").value)
                }
            })
            if (fetchData[DBKeys[index]].value.trim() === "") {
                fetchData[DBKeys[index]].value = document.getElementById(DBKeys[index] + "Safe").innerText
            }
            if (fetchData[DBKeys[index]].cooldown < 0) {
                fetchData[DBKeys[index]].cooldown = 0
            }
            if (fetchData[DBKeys[index]].delay < 0) {
                fetchData[DBKeys[index]].delay = 0
            }
            document.getElementById(`${DBKeys[index]}Safe`).innerText = document.getElementById(DBKeys[index] + "Link").value
            document.getElementById(DBKeys[index] + "Link").value = ""
        }
        // functions
        else if (functionsArray.includes(DBKeys[index])) {
            const obj = {
                state: document.getElementById(DBKeys[index] + "State").checked,
                stateTitle: {
                    anybody: document.getElementById(DBKeys[index] + "Anybody").checked,
                    subscriber: document.getElementById(DBKeys[index] + "Subscriber").checked,
                    vip: document.getElementById(DBKeys[index] + "Vip").checked,
                    moderator: document.getElementById(DBKeys[index] + "Moderator").checked,
                    broadcaster: document.getElementById(DBKeys[index] + "Broadcaster").checked
                },
                clipLength: document.getElementById("clipLength").value
            }
            if (obj.clipLength > 60) {
                obj.clipLength = 60
            }
            Object.assign(fetchData, { [DBKeys[index]]: obj })
        }
    }
    await saveValues(fetchData, saveBtn, btnText);
}

async function saveValues(fetchData, saveBtn, btnText) {
    try {
        const response = await fetch('/commands/save', {
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
            }, 5000);
        }
        else {
            alert("Fehler beim Speichern");
            saveBtn.disabled = false;
            saveBtn.innerText = btnText;
        }

    } catch (error) {
        console.error(error);
        alert("Server nicht erreichbar.");
        saveBtn.disabled = false;
        saveBtn.innerText = btnText;
    }
}


function deleteValues() {
    const DBKeys = Object.keys(data)
    for (let i = 0; i < DBKeys.length; i++) {
        if (DBKeys[i] != "Clip") {
            let ID = document.getElementById(`${DBKeys[i]}Link`)
            ID.value = ""
        }
    }
}