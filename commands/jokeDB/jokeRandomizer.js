import { Select } from "../../sql/sqlHandler.js";
import { getRandomInt } from "../../randomizer/randomNumber.js";

export async function randomJoke() {

    const randomArray = ['Chuck Norris Witze', 'Deine Mutter Witze', 'Tier Witze', 'Flach Witze'];
    const randomSection = randomArray[getRandomInt(randomArray.length)];
    try {
        const DB = await Select.JokesWithTrigger([randomSection]);
        const DBIndex = getRandomInt(DB.length);
        return {
            jokeTrigger: DB[DBIndex].triggers[0],
            jokePrompt: DB[DBIndex].response_text
        };
    } catch (error) {
        return {
            jokeTrigger: "keine Trigger gefunden",
            jokePrompt: error.message
        };
    };
};