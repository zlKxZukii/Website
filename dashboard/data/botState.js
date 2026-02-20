import express from "express"

import { botManager } from "../../twitch_bot/connectBot.js"
export const getBotState = express.Router()


getBotState.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";

    const { activate, deactivate } = req.query

    if (activate) {
        await botManager.start(username, userID)
    }
    if (deactivate) {
        await botManager.disconnect(userID)
    }
    res.redirect("/dashboard")
})