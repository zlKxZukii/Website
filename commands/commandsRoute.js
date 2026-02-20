import express from "express"
export let commandsRoute = express.Router()
import { getData } from "../src/firebase.js";


commandsRoute.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";

    if (!userID) {
        res.redirect("/?index=true")
    } else {
        const DB = await getData("commands", username, userID)
        const DBKeys = Object.keys(DB)
        const obj = {
            title: "Commands",
            css: "../css/commands/commands.css",
            username: username,
            img: img,
            defaultCommand: {},
            showBody: true
        }

        if (DB) {
            for (let index = 0; index < DBKeys.length; index++) {
                Object.assign(obj.defaultCommand, { [DBKeys[index]]: DB[DBKeys[index]] })
            }
        }
        res.render("main/commands/commands", obj)
    }
})
