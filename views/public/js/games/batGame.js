async function saveBatGame(btn, settings) {
    const btnText = btn.innerText;
    btn.innerText = 'Speichert...';
    btn.style.color = 'gray';
    btn.disabled = true;
    await fetchBatData(btn, btnText, settings);
};

async function fetchBatData(btn, btnText, fetchData) {

    try {
        const response = await fetch('/bat/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify(fetchData)
        });
        if (response.ok) {
            btn.innerText = "Erfolgreich gespeichert.";
            btn.style.animation = "rainbow 5s";
            setTimeout(() => {
                btn.disabled = false;
                btn.style.color = "white";
                btn.innerText = btnText;
                btn.style.animation = null;
            }, 5000);
        };
    } catch (error) {
        console.error(error);
        alert("Server nicht erreichbar.");
        btn.disabled = false;
        btn.innerText = btnText;
    }
}