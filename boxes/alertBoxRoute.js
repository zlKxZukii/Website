import express from "express"
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import crypto from "crypto";
import { title } from "process";

export let alertBoxRoute = express.Router()

alertBoxRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const DB = await Select.AlertBox([sessionData.userId])
        const obj = {
            link: `https://scaletta.live/alertbox/${DB[0].alert_key}`,
            css: "../../css/boxes/alert-box-route.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            title: "Alert Box",
            showBody: true,
            change: `http://scaletta.live/alertbox/${DB[0].alert_key}/renew`
        }
        res.render("main/boxes/alertBoxRoute.ejs", obj)
    } catch (error) {
        console.log(error)
    };
})

alertBoxRoute.get("/:key", async (req, res) => {
    const user = req.params.key
    const obj = {
        title: "ALERT BOX",
        css: "../../css/boxes/alert-box.css",
        showBody: false,
        targetUser: user
    }
    res.render("main/boxes/alertBox.ejs", obj)
})

alertBoxRoute.get("/:key/renew", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {

        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const newKey = crypto.randomBytes(64).toString("hex");
        await Insert.AlertBoxKey([sessionData.userId, newKey])
        await ClientManager.restartBot(sessionData.username, sessionData.userId, key)

    } catch (error) {
        console.log("Neuer Key kann nicht generiert werden " + error)
    }
    res.redirect("/alertbox")
})