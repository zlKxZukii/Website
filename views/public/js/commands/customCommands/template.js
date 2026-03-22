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
                                                                                    <label>
                <input type="checkbox" name="${key}LinkState" id="${key}LinkState" ${checkLinkState(elementTitle)} >
                        <div class="toggle"><span></span></div>
            </label>
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
    return `<div class="creation-window" id="creationWindow${counter}">
                <h2>Erstelle deinen eigenen Befehl:</h2>
                <div><label for="newDescription${counter}">Beschreibung:</label><input type="text" id="newDescription${counter}"
                        placeholder="Beschreibung des Befehls" autocomplete="off"></div>
                <div><label for="newValue${counter}">Ausgabe:</label><input type="text" id="newValue${counter}"
                        placeholder="Was der Befehl macht" autocomplete="off">
                </div>
                <div><label for="newTrigger${counter}">Trigger:</label><input type="text" id="newTrigger${counter}"
                        placeholder="Wie dieser Befehl angesprochen wird" autocomplete="off"></div>
                <button style="cursor: pointer;
    font-size: 24px;
    margin: 5px;
    padding: 5px;
    border-radius: 10px;
    border-color: #2bdffe;
    background-color: #222222;
    color: white;
    width: 30%;
    align-text:center;
    display:flex;
    justify-content:center;" class="creation-buttons" onclick="createCommand('${counter}', this)"> Speichern </button>
            </div>`
}


function allowList(title) {
    return `<li>
                <label>
                <input type="checkbox" name="" id="${title}Anybody" ${checkState(title, "anybody")} onclick="highlightAll('${title}')">
                    <div class="toggle"><span></span></div>
                </label>Jeder
            </li>
            <li>
                <label>
                <input type="checkbox" name="" id="${title}Subscriber" ${checkState(title, "subscriber")}>
                    <div class="toggle"><span></span></div>
                </label>Abonnenten
            </li>
            <li>
                <label>
                    <input type="checkbox" name="" id="${title}Vip" ${checkState(title, "vip")}>
                    <div class="toggle"><span></span></div>
                </label>VIP
            </li>
            <li>
                <label>
                    <input type="checkbox" name="" id="${title}Moderator" ${checkState(title, "moderator")}>
                    <div class="toggle"><span></span></div>
                </label>Moderatoren
            </li>
            <li>
                <label>
                <input type="checkbox" name="" id="${title}Broadcaster" ${checkState(title, "broadcaster")}>
                    <div class="toggle"><span></span></div>
                </label>Streamer
            </li>`
}

function checkState(key, chatBage) {
    if (customCommands[key].stateTitle[chatBage] == true) {
        return "checked"
    }
    else {
        return false
    }
}