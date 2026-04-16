const socialArray = ['Discord', 'Facebook', 'YouTube', 'TikTok', 'Instagram']
const functionsArray = ['Clip', 'Shoutout']

window.addEventListener("load", () => {
    const functionDiv = document.getElementById("functions")
    const renderSocialMedia = document.getElementById("socialMedia")
    renderDefaultCommands(renderSocialMedia)
    renderFunctions(functionDiv)
})

function renderDefaultCommands(renderDiv) {
    const title = Object.keys(data)
    title.sort()
    for (const entry of title) {
        if (socialArray.includes(entry)) {
            renderDiv.innerHTML += defaultCommandsTemplate(entry, data[entry])
        }
    }

}

function renderFunctions(div) {
    const title = Object.keys(data)
    title.sort()
    for (const entry of title) {
        if (entry === "Clip") {
            div.innerHTML += clipTemplate(entry, data[entry])
        }
        if (entry === "Shoutout") {
            div.innerHTML += shououtTemplate(entry, data[entry])
        }
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
                            value="${socialMedia.settings.cooldown}" min="0">
                        <p>Delay</p>
                        <input type="number" name="delay" id="${title}Delay" autocomplete="off"
                            value="${socialMedia.settings.delay}">
                    </div>
                </div>
            </div>`
}

function clipTemplate(title, socialMedia) {
    return `<div class="default-commands-checkbox">
                <div style="cursor: pointer;" class="default-commands" onclick="fadeIt('clip')">
                    <p>!clip</p>
                    <p>Clipt <b>automatisch</b></p>
                    <p></p>
                </div>
                <div class="checkbox">
                    <label>
                        <input id="${title}State" type="checkbox"${getState(socialMedia.state)}>
                        <div class="toggle"><span></span></div>
                    </label>
                </div>
            </div>
            <div class="closed" id="clipSlide">
                <div class="fade-box">
                <div class=align-slide>
                </div>
                <div style="width:30%;">
                </div>
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
                        <p>Die Länge der Clips <br> (maximal 60 Sekunden)</p>
                        <input type="number" name="clipLength" id="clipLength" value="${socialMedia.settings.clipLength}" max="60" min="0">
                    </div>
                </div>
            </div>`
}

function shououtTemplate(title, socialMedia) {
    return `<div class="default-commands-checkbox">
                <div style="cursor: pointer;" class="default-commands" onclick="fadeIt('shoutout')">
                    <p>!so, !sh, !shoutout</p>
                    <p>Shoutout</p>
                    <p></p>
                </div>
                <div class="checkbox">
                    <label>
                        <input id="${title}State" type="checkbox"${getState(socialMedia.state)}>
                        <div class="toggle"><span></span></div>
                    </label>
                </div>
            </div>
            <div class="closed" id="shoutoutSlide">
                <div class="fade-box">
                <div class="align-slide">
                    <p style="color:${socialMedia.settings.color || '#ffffff'}" id="${title}Safe">${socialMedia.response_text}</p>
                </div>
                <div class='text-section'>
                    <input id="${title}Text" type="text" name="textSender"
                        placeholder="Hier ${title} Text einfügen" autocomplete="off">
                    <ul>
                        <li>Platzhalter</li>
                        <li>-</li>
                        <li>Ehrengast</li>
                        <li>[viewer]</li>
                        <li>-</li>
                                                <li>Letztes Spiel</li>
                        <li>[game]</li>
                    </ul>
                </div>
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
                        <label for="colorPicker"> Die Farbe der Schrift</label>
                        <input type="color" name="colorPicker" id="colorPicker" value="${socialMedia.settings.color || '#ffffff'}">
                    </div>
                </div>
            </div>`}

function getState(state) {
    if (state === true) {
        return "checked"
    }
    else { return false }
}