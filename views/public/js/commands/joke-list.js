const jokeDiv = document.getElementById("renderJokes")

function renderJokes() {
    const jokeKey = Object.keys(jokeList)
    for (let index = 0; index < jokeKey.length; index++) {
        jokeDiv.innerHTML += `<div class="joke">
                                <p>${jokeKey[index]}</p>
                                <p>${jokeList[jokeKey[index]].prompt}</p>
                            </div>`

    }
}
renderJokes()