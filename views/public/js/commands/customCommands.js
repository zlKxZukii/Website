let cookiedocs = document.cookie
let counter = 0

//Speichern der Commands

function initSave() {
    document.getElementById("safeButton").disabled = true;
    checkNewFields()
    checkExistingFields()
    document.location.href = "/customcommands/save"
}

function checkExistingFields() {
    const getExistingTags = document.querySelectorAll(".default-commands")
    for (let index = 0; index < getExistingTags.length; index++) {
        const cookieObject = {
            category: getExistingTags[index].id,
            response_text: document.getElementById([getExistingTags[index].id] + "Link").value,
            cooldown: document.getElementById([getExistingTags[index].id] + "Cooldown").value,
            delay: document.getElementById([getExistingTags[index].id] + "Delay").value,
            state: document.getElementById([getExistingTags[index].id] + "LinkState").checked,
            triggers: document.getElementById([getExistingTags[index].id] + "Trigger").innerText,
            stateTitle: {
                anybody: document.getElementById([getExistingTags[index].id] + "Anybody").checked,
                broadcaster: document.getElementById([getExistingTags[index].id] + "Broadcaster").checked,
                vip: document.getElementById([getExistingTags[index].id] + "Vip").checked,
                subscriber: document.getElementById([getExistingTags[index].id] + "Subscriber").checked,
                moderator: document.getElementById([getExistingTags[index].id] + "Moderator").checked

            }
        };
        if (document.getElementById(`${getExistingTags[0].id + 'Link'}`).value === "") {
            Object.assign(cookieObject, { response_text: document.getElementById([getExistingTags[index].id] + "LinkId").innerText })
        }
        document.cookie = `${getExistingTags[index].id.split(" ").join("")}=${JSON.stringify(cookieObject)} ;max-age=100000`
    };
}

function checkNewFields() {
    const saveArray = ['newDescription', 'newValue', 'newTrigger'];
    if (!document.getElementById(`${saveArray[0]}0`)) {
        return
    }

    const cookieObject = {};
    for (let index = 0; index < counter; index++) {
        Object.assign(cookieObject, {
            category: document.getElementById(`${saveArray[0]}${index}`).value,
            response_text: document.getElementById(`${saveArray[1]}${index}`).value,
        });
        Object.assign(cookieObject, checkTrigger(saveArray, index))
        document.cookie = `${cookieObject.category.split(" ").join("")}=${JSON.stringify(cookieObject)} ;max-age=100000`
    }
};

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

function createCommand() {
    const windowContainer = document.getElementById("customWindow");
    windowContainer.insertAdjacentHTML('beforeend', creationWindow(counter));
    counter++;
}

// Löschen aller Zeilen
function deleteValues() {
    for (let index = 0; index < counter; index++) {
        const newDescription = document.getElementById(`newDescription${index}`).value = ""
        const newValue = document.getElementById(`newValue${index}`).value = ""
        const newTrigger = document.getElementById(`newTrigger${index}`).value = ""
    }
}

function deleteCommand(key) {
    document.location.href = `/customcommands/delete/${key}`
}