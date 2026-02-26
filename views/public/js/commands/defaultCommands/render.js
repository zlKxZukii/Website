window.addEventListener("load", () => {
    const renderDiv = document.getElementById("renderContent")
    renderDiv.innerHTML = headlineTemplate()
    renderDefaultCommands(renderDiv)
    renderDiv.innerHTML += renderButtons()
})

function headlineTemplate() {
    return `<div class="headline">
                <p>Commands</p>
                <p>Beschreibung</p>
                <p>Berechtigung</p>
                <p>Status</p>
            </div>`
}

function renderDefaultCommands(renderDiv) {
    const title = Object.keys(data)
    title.sort()
    for (let index = 0; index < title.length; index++) {
        renderDiv.innerHTML += defaultCommandsTemplate(title[index], data[title[index]])
    }
}

function defaultCommandsTemplate(title, socialMedia) {
    return `<div class="default-commands-checkbox">
                <div class="default-commands" onclick="fadeIt('${title}')">
                    <p>${socialMedia.triggers}</p>
                    <p>${title}</p>
                    <p></p>
                </div>
                <div class="checkbox">
                                                                <label>
                <input type="checkbox" name="${title}LinkState" id="${title}State" ${getState(socialMedia.state)}>
                <div class="toggle"><span></span></div>
            </label>
                </div>
            </div>

            <div class="closed" id="${title}Slide">
                <div class="fade-box">
                    <div class="link">
                        <a href="${socialMedia.response_text}" id="${title}Safe" target="_blank">${socialMedia.response_text}</a>
                    </div>
                    <input id="${title}Link" type="text" name="linkSender"
                        placeholder="Hier ${title} Link und/oder Text einfügen" autocomplete="off">
                    <ul class="allow-level">
                    <li>
                        <label>
                            <input type="checkbox" name="" id="${title}Anybody"  onclick="highlightAll('${title}')" ${getState(socialMedia.stateTitle.anybody)}>
                            <div class="toggle"><span></span></div>
                         </label>Jeder
                     </li>
                    <li>
                        <label>
                            <input type="checkbox" name="" id="${title}Subscriber" ${getState(socialMedia.stateTitle.subscriber)}>
                            <div class="toggle"><span></span></div>
                         </label>Abonnenten
                     </li>
                    <li>
                        <label>
                            <input type="checkbox" name="" id="${title}Vip" ${getState(socialMedia.stateTitle.vip)}>
                            <div class="toggle"><span></span></div>
                         </label>VIP
                     </li>
                    <li>
                        <label>
                            <input type="checkbox" name="" id="${title}Moderator" ${getState(socialMedia.stateTitle.moderator)}>
                            <div class="toggle"><span></span></div>
                         </label>Moderatoren
                     </li>
                    <li>
                        <label>
                            <input type="checkbox" name="" id="${title}Broadcaster" ${getState(socialMedia.stateTitle.broadcaster)}>
                            <div class="toggle"><span></span></div>
                         </label>Streamer
                     </li>
                    </ul>
                    <div class="cooldown">
                        <p>Cooldown</p>
                        <input type="number" name="cooldown" id="${title}Cooldown" autocomplete="off"
                            value="${socialMedia.cooldown}" min="0">
                        <p>Delay</p>
                        <input type="number" name="delay" id="${title}Delay" autocomplete="off"
                            value="${socialMedia.delay}">
                    </div>
                </div>
            </div>`
}

function getState(state){
    if (state === true){
        return "checked"
    }
    else{return false}
}

function renderButtons() {
    return `<div class="buttons">
                <button onclick="deleteValues()" id="deleteButton">Löschen</button>
                <button onclick="readValues()" id="safeButton">Speichern</button>
            </div>`
}