function getTemplate(key) {
    let elementTitle = customCommands[key][0]

    return `<div id="${key + "complete"}">
                <div class="default-commands-checkbox">
                    <div class="default-commands" onclick="fadeIt('${key}')" id="${key}">
                        <p id="${key}Trigger">${elementTitle.trigger}</p>
                        <p>${key}</p>
                        <p></p>
                    </div>
                    <div class="checkbox">
                        <input type="checkbox" name="${key}LinkState" id="${key}LinkState" ${checkLinkState(elementTitle)} >
                        <button onclick="deleteCmd(${key + "complete"}, ${key})">x</button>
                    </div>
                </div>
                <div class="closed" id="${key}Slide">
                    <div class="fade-box">
                        <div class="link">
                            <a id="${key}LinkId" href="${elementTitle.value}" target="_blank">${elementTitle.value}</a>
                        </div>
                        <input id="${key}Link" type="text" name="linkSender"
                            placeholder="Hier deine Ausgabe für ${key} eingeben" autocomplete="off">
                        <ul class="allow-level">
                            ${allowList(key)} 
                        </ul>
                        <div class="cooldown">
                            <p>Cooldown</p>
                            <input type="number" name="cooldown" id="${key}Cooldown" autocomplete="off"
                                value="${elementTitle.cooldown}">
                            <p>Delay</p>
                            <input type="number" name="delay" id="${key}Delay" autocomplete="off"
                                value="${elementTitle.delay}">
                        </div>
                    </div>
                </div>
            </div>`
}

function checkLinkState(elementTitle) {
    if (elementTitle.state == true) {
        return "checked"
    }
    else {
        return false
    }
}

function creationWindow(counter) {
    return `            <div class="creation-window" id="creationWindow${counter}">
                <h2>Erstelle deinen eigenen Befehl:</h2>
                <div><label for="newDescription${counter}">Beschreibung:</label><input type="text" id="newDescription${counter}"
                        placeholder="Beschreibung des Befehls" autocomplete="off"></div>
                <div><label for="newValue${counter}">Ausgabe:</label><input type="text" id="newValue${counter}"
                        placeholder="Was der Befehl macht" autocomplete="off">
                </div>
                <div><label for="newTrigger${counter}">Trigger:</label><input type="text" id="newTrigger${counter}"
                        placeholder="Wie dieser Befehl angesprochen wird" autocomplete="off"></div>
            </div>`
}


function allowList(title) {
    return `<li><input type="checkbox" name="" id="${title}anybody" ${checkState(title, "anybody")}>Jeder</li>
            <li><input type="checkbox" name="" id="${title}subscriber" ${checkState(title, "subscriber")}>Subscriber</li>
            <li><input type="checkbox" name="" id="${title}vip" ${checkState(title, "vip")}>VIP</li>
            <li><input type="checkbox" name="" id="${title}moderator" ${checkState(title, "moderator")}>Moderatoren</li>
            <li><input type="checkbox" name="" id="${title}broadcaster" ${checkState(title, "broadcaster")}>Streamer</li>`
}

function checkState(key, chatBage) {
    if (customCommands[key][0].stateTitle[chatBage] == true) {
        return "checked"
    }
    else {
        return false
    }
}