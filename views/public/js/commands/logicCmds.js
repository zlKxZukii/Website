function fadeIt(title) {
    document.getElementById(`${title}Slide`).classList.toggle("fade-open")
}

function deleteCmd(titleC, title) {
    titleC.remove()
    document.location.href = `/customdata?deleteCustomData=true&id=${title.id}&returnquery=ccommands`
}

const buttons = document.querySelectorAll("button")

for (let index = 0; index < buttons.length; index++) {
    buttons[index].addEventListener("click", () =>{
        buttons[index].disabled = true;
    })
}

function highlightAll(title) {
    document.getElementById(title+"Subscriber").checked = true;
    document.getElementById(title+"Vip").checked = true;
    document.getElementById(title+"Moderator").checked = true;
    document.getElementById(title+"Broadcaster").checked = true;

}