import express from "express"

import { botManager } from "../../twitch_bot/connectBot.js"
import client from "../../src/redisClient.js"
export const getBotState = express.Router()


getBotState.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator;
    const sessionData = await JSON.parse(await client.get(`sess:${key}`));
    const userID = sessionData.userId
    const username = sessionData.username

    const { activate, deactivate } = req.query

    if (activate) {
        await botManager.start(username, userID)
    }
    if (deactivate) {
        await botManager.disconnect(userID)
    }
    res.redirect("/dashboard")
})