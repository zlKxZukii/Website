function readVal() {
    const followBtn = document.getElementById("followBtn")
    followBtn.disabled = true;
    const colorPicker = document.getElementById("colorPicker")
    const volume = document.getElementById("volume")

    saveValue(volume.value, colorPicker.value, text.value)
}

function saveValue(volume, colorPicker, text) {
    const obj = {
        volume: volume,
        colorPicker: colorPicker,
        responseText: text
    };

    document.cookie = `${"Follow"}=${decodeURIComponent(JSON.stringify(obj))};max-age=10000000`
    window.location.href = '/follows/save'
}