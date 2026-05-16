async function saveSettings(btn) {
    const data = {
        fontColor: fontColor.value,
        barTop: upperBar.value,
        barMiddle: middleBar.value,
        barBottom: underBar.value,
        rotation: roationState.checked
    }
    console.log(data)
    const btnText = btn.innerText;
    btn.disabled = true;
    btn.style.color = 'gray'
    btn.innerText = 'Speichert...'
    await saveData(btnText, btn, data)
}

async function saveData(btnText, btn, data) {
    try {
        const response = await fetch('/lastfm/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(data)
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