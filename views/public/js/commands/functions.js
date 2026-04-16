async function safeState(button) {
    try {
        button.disabled = true
        const btnText = button.innerText
        const fetchData = {}
        for (const state of tagArray) {
            let stateValue = document.getElementById(state)
            Object.assign(fetchData, { [state]: stateValue.checked })

        }
        const response = await fetch('/security/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(fetchData)
        })
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
    } catch (error) {
        console.log(error)
    }
}

function fadeIt(title) {
    document.getElementById(`${title}Slide`).classList.toggle("fade-open")
}