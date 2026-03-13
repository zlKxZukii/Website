function readVal() {
    const followBtn = document.getElementById("followBtn")
    followBtn.disabled = true;
    const colorPicker = document.getElementById("colorPicker")
    const volume = document.getElementById("volume")

    saveValue(volume.value, colorPicker.value, text.value)
}

function saveValue(volume, color, text) {
    const obj = {
        volume: volume,
        color: color,
        response_text: text
    };

    document.cookie = `${"Follow"}=${decodeURIComponent(JSON.stringify(obj))};max-age=10000000`
    window.location.href = '/follows/save'
}