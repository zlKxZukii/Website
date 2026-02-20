import express from "express"
import { deleteData, getData, saveData } from "../../src/firebase.js"
import { restartBot } from "../../twitch_bot/connectBot.js";
export let commandDataRoute = express.Router()
import animals from "../jokeDB/animals.json" with{type: "json"};
import chuckNorris from "../jokeDB/chuckNorris.json" with{type: "json"};
import deineMudda from "../jokeDB/deineMudda.json" with{type: "json"};
import flachWitze from "../jokeDB/flachWitze.json" with{type: "json"}
import crypto from "crypto";

commandDataRoute.get((""), async (req, res) => {
    const cookie = req.cookies
    const cookieKeys = Object.keys(cookie)
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";

    if (req.query.cookie == "accepted") {
        res.cookie("cookie", "accepted", { signed: true, secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 * 24 * 7 })
    }
    if (req.query.alertkey === "true") {
        const back = req.query.back
        const key = crypto.randomBytes(12).toString("hex");
        await saveData("alertBox", username, userID, { key: key })
        restartBot(username, userID)
        res.redirect(`/${back}`)
    }
    else if (req.query.intervall === "true") {
        if (req.query.delete) {
            await deleteData("intervalls", username, userID, req.query.delete)
        }
        const DB = await getData("intervalls", username, userID)
        const obj = {}
        if (DB) {
            Object.assign(obj, DB)
        }
        for (let index = 0; index < cookieKeys.length; index++) {
            if (cookieKeys[index] != "cookie") {
                const vals = JSON.parse(cookie[cookieKeys[index]])
                Object.assign(obj, {
                    [cookieKeys[index]]: {
                        text: vals.text,
                        intervallName: vals.intervallName,
                        state: vals.state,
                        intervall: vals.intervall
                    }
                })
                res.cookie(vals.intervallName, "", { maxAge: 0 })
            }
        }
        await saveData("intervalls", username, userID, obj)
        restartBot(username, userID)
        res.redirect("/intervall")
    }
    else if (req.query.jokes == "true") {
        const obj = {}
        const jokeArr = { animals, chuckNorris, deineMudda, flachWitze }

        for (let index = 0; index < cookieKeys.length; index++) {
            if (cookieKeys[index] != "cookie") {
                if (jokeArr[cookieKeys[index]]) {
                    Object.assign(obj, {
                        [cookieKeys[index]]:
                        {
                            state: cookie[cookieKeys[index]],
                            trigger: jokeArr[cookieKeys[index]].trigger
                        }
                    })
                }
                res.cookie(cookieKeys[index], "", { maxAge: 0 })
            }
        }

        saveData("jokes", username, userID, obj)
        await restartBot(username, userID)
        res.redirect("/jokes")
    }
    else if (req.query.sign == "signout" || req.query.nocookie == "declined") {
        signOut(req, res)
    }

    else if (req.query.functions == "true") {
        const Obj = {}
        for (let index = 0; index < cookieKeys.length; index++) {
            if (cookieKeys[index] != "cookie") {
                res.cookie(cookieKeys[index], "", { maxAge: 0 })
                Object.assign(Obj, { [cookieKeys[index]]: cookie[cookieKeys[index]] })
            }
        }
        saveData("streamFunctions", username, userID, Obj)
        await restartBot(username, userID)
        res.redirect("/functions")
    }

    else if (req.query.defaultdata == "true") {
        const DB = await getData("commands", username, userID)
        const obj = {}
        for (let index = 0; index < cookieKeys.length; index++) {

            if (cookieKeys[index] != "cookie") {
                const raw = JSON.parse(cookie[cookieKeys[index]])
                Object.assign(obj, {
                    [cookieKeys[index]]: {
                        state: raw.state,
                        value: raw.value,
                        stateTitle: {
                            anybody: raw.stateTitle.anybody,
                            subscriber: raw.stateTitle.subscriber,
                            vip: raw.stateTitle.vip,
                            moderator: raw.stateTitle.moderator,
                            broadcaster: raw.stateTitle.broadcaster
                        },
                        cooldown: raw.cooldown,
                        delay: raw.delay,
                        trigger: DB[cookieKeys[index]].trigger
                    }
                })
                res.cookie(cookieKeys[index], "", { maxAge: 0 })
            }
        }
        await restartBot(username, userID)
        saveData("commands", username, userID, obj)
        res.redirect("/commands")
    }
})


function signOut(req, res) {
    const signedCookieKeys = Object.keys(req.signedCookies)
    const defCookie = Object.keys(req.cookies)

    for (let index = 0; index < signedCookieKeys.length; index++) {
        res.cookie(signedCookieKeys[index], "", { maxAge: 0 })
    }
    for (let index = 0; index < defCookie.length; index++) {
        res.cookie(defCookie[index], " ", { maxAge: 0 })

    }
    if (req.query.nocookie) {
        res.redirect("/nono")
    }
    else {
        res.redirect("/")
    }
}