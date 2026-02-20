import express from "express"
import { getData } from "../src/firebase.js";
export const functionsRoute = express.Router()

functionsRoute.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";
    if (!userID) {
        res.redirect("/?index=true")
    }
    else {
        const DB = await getData("streamFunctions", username, userID)
        const obj = {
            title: `Funktionen`,
            css: "css/commands/functions.css",
            username: username,
            img: img,
            showBody: true,
            values: {
                followBot:DB.followBot,
                spamBot: DB.spamBot,
                clip: DB.clip
            }
        }
        res.render("main/commands/functions", obj)
    }
})