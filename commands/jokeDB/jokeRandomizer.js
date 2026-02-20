import animals from "./animals.json" with{type: "json"};
import chuckNorris from "./chuckNorris.json" with{type: "json"};
import deineMudda from "./deineMudda.json" with{type: "json"};
import flachWitze from "./flachWitze.json" with{type: "json"}
import { getRandomInt } from "../../randomizer/randomNumber.js"



const randomArray = [chuckNorris, deineMudda, animals, flachWitze]

export function randomJoke() {
    const DBIndex = getRandomInt(randomArray.length)
    let DB = randomArray[DBIndex]

    let lengthTrigger = Object.keys(DB.trigger).length
    let intTrigger = getRandomInt(lengthTrigger)

    let lengthJoke = Object.keys(DB.jokes).length
    let intJoke = getRandomInt(lengthJoke)
    if (intJoke <= 0) {
        intJoke = 1
    }

    return {
        trigger: DB.trigger[intTrigger],
        prompt: DB.jokes[intJoke]
    }
}