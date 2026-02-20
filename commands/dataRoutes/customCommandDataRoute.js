import express from "express"
export let customCommandDataRoute = express.Router()
import { getData, saveData, deleteData } from "../../src/firebase.js";
import { restartBot } from "../../twitch_bot/connectBot.js";

customCommandDataRoute.get((""), async (req, res) => {
    const obj = {}
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const cookieKeys = Object.keys(req.cookies)
    const DB = await getData("customCommands", username, userID)
    const { deleteCustomData, id } = req.query;

    if (deleteCustomData) {
        await deleteData("customCommands", username, userID, id)
        restartBot(username, userID)
        res.redirect(`/customCommands`)
    }
    else {
        if (DB) {
            Object.assign(obj, DB)
        }
        getNewEntries(obj, req, cookieKeys)
        updateEntries(obj, DB, req, cookieKeys)
        await saveData("customCommands", username, userID, obj)
        for (let index = 0; index < cookieKeys.length; index++) {
            if ([cookieKeys[index]] != "cookie") {
                res.cookie(cookieKeys[index], "", { maxAge: 0 })
            }
        }
        const botState = await getData("botState", username, userID)
        if (botState.state) {
            restartBot(username, userID)
        }
        res.redirect("/customCommands")

    }
}
)

function getNewEntries(obj, req, cookieKeys) {
    for (let index = 0; index < cookieKeys.length; index++) {
        if ([cookieKeys[index]] != "cookie") {
            let jsonVals = JSON.parse(req.cookies[cookieKeys[index]])

            const workObj = {
                [cookieKeys[index]]: {
                    cooldown: 0,
                    delay: 0,
                    state: true,
                    stateTitle: {
                        anybody: true,
                        broadcaster: true,
                        moderator: true,
                        vip: true,
                        subscriber: true
                    },
                    trigger: jsonVals.trigger,
                    value: jsonVals.value
                }
            }
            Object.assign(obj, workObj)
        }
    }
}

function updateEntries(obj, DB, req, cookieKeys) {
    for (let index = 0; index < cookieKeys.length; index++) {
        if (Object.keys(DB).includes(cookieKeys[index])) {
            let appendObj = { [cookieKeys[index]]: JSON.parse(req.cookies[cookieKeys[index]]) }
            Object.assign(obj, appendObj)
        }
    }
}