async function readVal(button, type) {

    const btnText = button.innerText;
    button.disabled = true;
    button.innerText = "Speichert...";

    const state = document.getElementById(`${type}State`).checked;
    const volume = document.getElementById("volume").value;
    const duration = document.getElementById("duration").value;
    const responseText = document.getElementById("responseText").value;
    const colorPicker = document.getElementById("textColor").value;
    const selectedLayout = document.querySelector('input[name="layoutSelection"]:checked')?.value;
    const weight = document.getElementById('font-weight').value;
    const decoration = document.getElementById('font-decoration').value;
    const family = document.getElementById('font-family').value;
    const size = document.getElementById('font-size').value;
    
    const data = {
        state,
        volume,
        duration,
        responseText,
        color: colorPicker,
        selectedLayout,
        weight,
        decoration,
        family,
        size
    }
    Object.assign(data, checkType(type));
    await saveValue(data, btnText, button, type);
}

function checkType(type) {
    if (type === 'follows') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            }
        }
    }
    else if (type === 'subs') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        const tierColor = document.getElementById("tierColor").value
        const tierRainbow = document.getElementById("tierRainbow").checked
        const tierAnimation = document.getElementById("tierAnimation").value
        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            },
            tier: {
                color: tierColor,
                rainbow: tierRainbow,
                animation: tierAnimation
            },
        }
    }
    else if (type === 'subgifts') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        const amountColor = document.getElementById("amountColor").value
        const amountRainbow = document.getElementById("amountRainbow").checked
        const amountAnimation = document.getElementById("amountAnimation").value
        const tierColor = document.getElementById("tierColor").value
        const tierRainbow = document.getElementById("tierRainbow").checked
        const tierAnimation = document.getElementById("tierAnimation").value
                const cumulativColor = document.getElementById("cumulativColor").value
        const cumulativRainbow = document.getElementById("cumulativRainbow").checked
        const cumulativAnimation = document.getElementById("cumulativAnimation").value
        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            },
            amount: {
                color: amountColor,
                rainbow: amountRainbow,
                animation: amountAnimation
            },
            tier: {
                color: tierColor,
                rainbow: tierRainbow,
                animation: tierAnimation
            },
            cumulativ:{
                color: cumulativColor,
                rainbow: cumulativRainbow,
                animation: cumulativAnimation
            }
        }
    }
    else if (type === 'raids') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        const amountColor = document.getElementById("amountColor").value
        const amountRainbow = document.getElementById("amountRainbow").checked
        const amountAnimation = document.getElementById("amountAnimation").value
        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            },
            amount: {
                color: amountColor,
                rainbow: amountRainbow,
                animation: amountAnimation
            },
        }
    }
    else if (type === 'bits') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        const amountColor = document.getElementById("amountColor").value
        const amountRainbow = document.getElementById("amountRainbow").checked
        const amountAnimation = document.getElementById("amountAnimation").value
        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            },
            amount: {
                color: amountColor,
                rainbow: amountRainbow,
                animation: amountAnimation
            },
        }
    }
    else if (type === 'subongoings') {
        const viewerColor = document.getElementById("viewerColor").value
        const viewerRainbow = document.getElementById("viewerRainbow").checked
        const viewerAnimation = document.getElementById("viewerAnimation").value
        const streamerColor = document.getElementById("streamerColor").value
        const streamerRainbow = document.getElementById("streamerRainbow").checked
        const streamerAnimation = document.getElementById("streamerAnimation").value
        const tierColor = document.getElementById("tierColor").value
        const tierRainbow = document.getElementById("tierRainbow").checked
        const tierAnimation = document.getElementById("tierAnimation").value
        const postColor = document.getElementById("postColor").value
        const postRainbow = document.getElementById("postRainbow").checked
        const postAnimation = document.getElementById("postAnimation").value
        const bundleColor = document.getElementById("bundleColor").value
        const bundleRainbow = document.getElementById("bundleRainbow").checked
        const bundleAnimation = document.getElementById("bundleAnimation").value
        const streakColor = document.getElementById("streakColor").value
        const streakRainbow = document.getElementById("streakRainbow").checked
        const streakAnimation = document.getElementById("streakAnimation").value
        const cumulativColor = document.getElementById("cumulativColor").value
        const cumulativRainbow = document.getElementById("cumulativRainbow").checked
        const cumulativAnimation = document.getElementById("cumulativAnimation").value

        return {
            viewer: {
                color: viewerColor,
                rainbow: viewerRainbow,
                animation: viewerAnimation
            },
            streamer: {
                color: streamerColor,
                rainbow: streamerRainbow,
                animation: streamerAnimation
            },
            tier: {
                color: tierColor,
                rainbow: tierRainbow,
                animation: tierAnimation
            },
            post:{
                color: postColor,
                rainbow: postRainbow,
                animation: postAnimation
            },
            bundle: {
                color: bundleColor,
                rainbow: bundleRainbow,
                animation: bundleAnimation
            },
            streak: {
                color: streakColor,
                rainbow: streakRainbow,
                animation: streakAnimation
            },
            cumulativ: {
                color: cumulativColor,
                rainbow: cumulativRainbow,
                animation: cumulativAnimation
            }
        }
    }
}

async function saveValue(data, btnText, button, type) {

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
                button.style.animation = null
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