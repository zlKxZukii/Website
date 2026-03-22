import express from "express"
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import crypto from "crypto";

export let browserToolsRoute = express.Router()

browserToolsRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        // Sql Einträge erstellen.
        // const DB = await Select
        const obj = {
            css: "../../css/boxes/help.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            title: "Browser Tools",
            showBody: true,
        }
        res.render("main/browserTools/browserTools.ejs", obj)
    } catch (error) {
        console.log(error)
    }
})