import { Select, Insert } from "../sql/sqlHandler.js";
import client from "../src/redisClient.js";

import express from "express"
import { ClientManager } from "../twitch_bot/connectBot.js";
export const securityRoute = express.Router()

securityRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true")
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const DB = await Select.AccessShield([sessionData.userId])
    const obj = {
        title: `Sicherheit`,
        css: "css/commands/security.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        showBody: true,
        values: {}
    }
    for (let index = 0; index < DB.length; index++) {
        Object.assign(obj.values, { [DB[index].category]: DB[index].state })
    }
    res.render("main/commands/security", obj)
})

securityRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const accessKey = Object.keys(req.body);
    const user = ClientManager.getClient(sessionData.userId)

    for (const key of accessKey) {
        for (const keyIndex in accessKey) {
            if (key === user.accessShieldState[keyIndex].category) {
                user.accessShieldState[keyIndex].state = req.body[key]
            }
        }
        await Insert.AccessShield([sessionData.userId, key, req.body[key]]);
    }

    res.redirect("/security");
});