function copyBtn() {
    const input = document.getElementById('linkBox');
    const button = document.getElementById("saveBtn")
    button.textContent = 'Kopiert ✔';
    input.select();
    input.setSelectionRange(0, 99999); // für Mobile

    navigator.clipboard.writeText(input.value);
}

function deleteBlur(inputID) {
    const blurObject = document.getElementById(inputID); // z.B. das Element, das geblurt werden soll
    blurObject.addEventListener("click", () => {
        blurObject.classList.remove("blur")
    })
    blurObject.addEventListener('mouseleave', () => {
        setTimeout(() => {
            blurObject.classList.add('blur');
        }, 1000); 
    });
}

function reloadKey(back) {
    window.location.href=`/data?alertkey=true&back=${back}`
}