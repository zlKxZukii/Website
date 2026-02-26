function fadeIt(title) {
    document.getElementById(`${title}Slide`).classList.toggle("fade-open")
}

function deleteCmd(titleC, title) {
    titleC.remove()
    document.location.href = `/customdata?deleteCustomData=true&id=${title.id}&returnquery=ccommands`
}

function highlightAll(title) {
    if (!document.getElementById(`${title + 'Anybody'}`).checked) {
        return;
    };
    document.getElementById(`${title + 'Subscriber'}`).checked = true;
    document.getElementById(title + "Vip").checked = true;
    document.getElementById(title + "Moderator").checked = true;
    document.getElementById(title + "Broadcaster").checked = true;
}