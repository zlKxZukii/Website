async function readVal(button, type) {
    const colorPicker = document.getElementById("colorPicker");
    const volume = document.getElementById("volume");
    const responseText = document.getElementById("responseText");
    const btnText = button.innerText

    button.disabled = true;
    button.innerText = "Speichert..."
    await saveValue(volume.value, colorPicker.value, responseText.value, btnText, button, type)
}

async function saveValue(volume, color, text, btnText, button, type) {

    const data = {
        volume: volume,
        color: color,
        response_text: text
    };
    
    try {
        const response = await fetch(`/${type}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            button.innerText = "Erfolgreich gespeichert.";
            button.style.animation = "rainbow 5s"
            setTimeout(() => {
                button.disabled = false;
                button.style.color = "white"
                button.innerText = btnText;
            }, 5000);
        }
        else {
            alert("Fehler beim Speichern");
            button.disabled = false;
            button.innerText = btnText;
        }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Server nicht erreichbar.");
        button.disabled = false;
        button.innerText = btnText;
    }
}