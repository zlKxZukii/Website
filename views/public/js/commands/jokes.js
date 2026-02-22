const keyArr = Object.keys(data)
function safeJokes() {
    for (let index = 0; index < keyArr.length; index++) {

        const val = document.getElementById(data[keyArr[index]].id.split(" ").join(""))
        document.cookie = `${data[keyArr[index]].category.split(" ").join("_")} = ${val.checked} ;max-age=1000`
    }
    window.location.href = "/jokes/save"
}