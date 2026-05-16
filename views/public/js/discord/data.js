async function createHook(btn) {
    const hook = document.getElementById('webhook')
    const btnText = btn.innerText;
    btn.disabled = true;
    btn.style.color = 'gray'
    btn.innerText = 'Speichert...'
    await createData(btnText, btn, { hook: hook.value })
    hook.value = ""
}

async function createData(btnText, btn, hook) {
    try {
        const response = await fetch('/discord/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(hook)
        })
        if (response.ok) {
            btn.innerText = "Erfolgreich gespeichert.";
            btn.style.animation = "rainbow 5s";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.color = "white";
                btn.innerText = btnText;
                btn.style.animation = null;
            }, 5000);
        }
        else {
            btn.disabled = true;
            btn.style.color = "red";
            btn.innerText = "FEHLER ";
        }
    } catch (error) {
        btn.disabled = true;
        btn.color = "red";
        btn.innerText = "FEHLER " + error;
    }
}

async function deleteHook(btn) {
    const id = btn.id.replace("Btn", "");
    const hookDiv = document.getElementById(id)
    const hookSettings = document.getElementById(`${id}settings`)

    const response = await fetch('/discord/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Action-Type': 'Save-Follower-Settings'
        },
        body: JSON.stringify({ hook: id })
    })

    if (response.ok) {
        console.log(hookSettings)
        hookDiv.remove();
        hookSettings.remove();
    }
}

async function saveSettings(btn) {
    const obj = {}
    const keys = Object.keys(data)
    for (const hook of keys) {
        const messageIn = document.getElementById(`${hook}messageIn`).value
        const messageOut = document.getElementById(`${hook}messageOut`).value
        const colorPicker = document.getElementById(`${hook}colorPicker`).value
        Object.assign(obj, {
            [hook]: {
                messageIn,
                messageOut,
                colorPicker
            }
        })
    }

    const btnText = btn.innerText;
    btn.disabled = true;
    btn.style.color = 'gray'
    btn.innerText = 'Speichert...'
    await saveData(btnText, btn, obj)
}

async function saveData(btnText, btn, obj) {

        try {
        const response = await fetch('/discord/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(obj)
        })
        if (response.ok) {
            btn.innerText = "Erfolgreich gespeichert.";
            btn.style.animation = "rainbow 5s";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.color = "white";
                btn.innerText = btnText;
                btn.style.animation = null;
            }, 5000);
        }
        else {
            btn.disabled = true;
            btn.style.color = "red";
            saveBtn.innerText = "FEHLER ";
        }
    } catch (error) {
        btn.disabled = true;
        btn.color = "red";
        btn.innerText = "FEHLER " + error;
    }
}