function getTemplate(key) {
    let elementTitle = customCommands[key]
    return `<div id="${key + "complete"}">
                <div class="default-commands-checkbox">
                    <div class="default-commands" onclick="fadeIt('${key}')" id="${key}">
                        <p id="${key}Trigger">${elementTitle.triggers}</p>
                        <p>${key}</p>
                        <p></p>
                    </div>
                    <div class="checkbox">
                        <input type="checkbox" name="${key}LinkState" id="${key}LinkState" ${checkLinkState(elementTitle)} >
                        <button onclick="deleteCommand('${key}')">x</button>
                    </div>
                </div>
                <div class="closed" id="${key}Slide">
                    <div class="fade-box">
                        <div class="link">
                            <a id="${key}LinkId" href="${elementTitle.response_text}" target="_blank">${elementTitle.response_text}</a>
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
    return `<li><input type="checkbox" name="" id="${title}Anybody" ${checkState(title, "anybody")} onclick="highlightAll('${title}')">Jeder</li>
            <li><input type="checkbox" name="" id="${title}Subscriber" ${checkState(title, "subscriber")}>Subscriber</li>
            <li><input type="checkbox" name="" id="${title}Vip" ${checkState(title, "vip")}>VIP</li>
            <li><input type="checkbox" name="" id="${title}Moderator" ${checkState(title, "moderator")}>Moderatoren</li>
            <li><input type="checkbox" name="" id="${title}Broadcaster" ${checkState(title, "broadcaster")}>Streamer</li>`
}

function checkState(key, chatBage) {
    if (customCommands[key].stateTitle[chatBage] == true) {
        return "checked"
    }
    else {
        return false
    }
}