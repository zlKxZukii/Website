function readValues() {
    document.getElementById("safeButton").disabled
    const DBKeys = Object.keys(data)
    const obj = {}
    for (let index = 0; index < DBKeys.length; index++) {
        if (socialArray.includes(DBKeys[index])) {
            Object.assign(obj, {
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
            })
            if (obj.value.trim() === "") {
                obj.value = document.getElementById(DBKeys[index] + "Safe").innerText
            }
            if (obj.cooldown < 0) {
                obj.cooldown = 0
            }
            if (obj.delay < 0) {
                obj.delay = 0
            }

            document.cookie = `${DBKeys[index]}=${decodeURIComponent(JSON.stringify(obj))};max-age=10000`
        }
        if (functionsArray.includes(DBKeys[index])) {
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
            document.cookie = `${DBKeys[index]}=${decodeURIComponent(JSON.stringify(obj))};max-age=10000000`
        }
    }
    window.location.href = '/commands/save'
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