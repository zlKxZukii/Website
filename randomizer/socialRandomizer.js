import socialMedia from "../index/DB/socialMedia.json" with{type: 'json'};
import { getRandomInt } from "./randomNumber.js";

export function randomSocialMedia() {
    const socialIndex = getRandomInt(socialMedia.trigger.length)
    if (socialIndex <= 1) {
        return {
            trigger: [socialMedia.trigger[socialIndex]],
            prompt: [socialMedia.whatsapp]
        }
    }
    else {
        return {
            trigger: [socialMedia.trigger[socialIndex]],
            prompt: [socialMedia.discord]
        }
    }
}