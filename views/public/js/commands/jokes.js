const jokeArray = ["animals", "chuckNorris", "deineMudda", "flachWitze"]

function safeJokes() {
    for (let index = 0; index < jokeArray.length; index++) {
        const val = document.getElementById(jokeArray[index])
        document.cookie = `${jokeArray[index]} = ${val.checked} ;max-age=1000`
    }
    window.location.href = "/data?jokes=true"
}