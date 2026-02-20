import express, { request } from "express"
export let indexRoute = express.Router()
import { randomJoke } from "../commands/jokeDB/jokeRandomizer.js"
import { randomSocialMedia } from "../randomizer/socialRandomizer.js"

import requestIP from "request-ip"

indexRoute.get((""), async (req, res) => {
    
    let username = req.signedCookies.username || "";
    let img = req.signedCookies.profilePic || "";
    const jokeObj = randomJoke()
    const social = randomSocialMedia()

    const indexObj = {
        title: "Start",
        css: "../css/index.css",
        username: username,
        img: img,
        jokeTrigger: jokeObj.trigger,
        jokePrompt: jokeObj.prompt,
        socialMediaTrigger: social.trigger,
        socialMediaPrompt: social.prompt,
        showBody: true
    }

    if (req.query.index === "true") {
        Object.assign(indexObj, {
            indexText: "Bitte erst anmelden."
        })
    }
    res.render("main/index.ejs", indexObj)
})