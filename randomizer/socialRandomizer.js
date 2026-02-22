import socialMedia from "../index/DB/socialMedia.json" with{type: 'json'};
import { getRandomInt } from "./randomNumber.js";

export function randomSocialMedia() {
    const socialIndex = getRandomInt(socialMedia.trigger.length)
    if (socialIndex <= 1) {
        return {
            socialMediaTrigger: [socialMedia.trigger[socialIndex]],
            socialMediaPrompt: [socialMedia.whatsapp]
        }
    }
    else {
        return {
            socialMediaTrigger: [socialMedia.trigger[socialIndex]],
            socialMediaPrompt: [socialMedia.discord]
        }
    }
}