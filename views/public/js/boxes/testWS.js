async function testWS(button, type) {
    button.disabled = true;
    button.style.color = "grey";
    button.innerText = "Test läuft...";


    setTimeout(() => {
        button.disabled = false;
        button.style.color = "white";
        button.innerText = "Teste mich";
    }, 12000);

    try {
        const response = await fetch(`/${type}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Action-Type': 'Save-Follower-Settings'
            },
            body: JSON.stringify({ success: true })
        });

        if (!response.ok) {
            console.log(response.status)
        }

    } catch (error) {
        console.log("Fehler beim testen der AlertBox " + error)
        button.disabled = false;
        button.style.color = "white";
        button.innerText = "Teste mich";
    }
};