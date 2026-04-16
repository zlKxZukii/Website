const allDeactiveButton = document.getElementById('button1');
const allActiveButton = document.getElementById('button2');
const saveButton = document.getElementById('button3');
const btnArr = [allDeactiveButton, allActiveButton, saveButton];
const keyArr = Object.keys(data)

async function safeJokes(button) {
    for (const btn of btnArr) {
        btn.disabled = true
    }
    const fetchData = {}
    for (const key of keyArr) {
        const val = document.getElementById(data[key].category)
        Object.assign(fetchData, { [data[key].category]: val.checked })
    }
    // window.location.href = "/jokes/save"
    await fetchJokes(fetchData, button)
}

async function acDeButton(state, button) {
    for (const btn of btnArr) {
        btn.disabled = true
    }
    const fetchData = {}
    for (const key of keyArr) {
        if (state) {
            document.getElementById(data[key].category).checked = true;
        } else {
            document.getElementById(data[key].category).checked = false;
        }
        Object.assign(fetchData, { [data[key].category]: state })
    }
    await fetchJokes(fetchData, button)
}

async function fetchJokes(data, btn) {
    console.log()
    const btnText = btn.innerText
    try {
        const response = await fetch('/jokes/save', {
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
            btn.style.animation = "rainbow 5s"
            setTimeout(() => {
                for (const btn of btnArr) {
                    btn.disabled = false
                }
                btn.style.color = "white"
                btn.innerText = btnText;
                btn.style.animation = null
            }, 5000);
        }
        else {
            alert("Fehler beim Speichern");
            for (const btn of btnArr) {
                btn.disabled = false
            }
            btn.innerText = btnText;
        }

    } catch (error) {
        console.error(error);
        alert("Server nicht erreichbar.");
        for (const btn of btnArr) {
            btn.disabled = false
        }
        btn.innerText = btnText;
    }
}