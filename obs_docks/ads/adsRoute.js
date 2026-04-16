import express from "express"
import client from "../../src/redisClient.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
import { Insert } from "../../sql/sqlHandler.js";
import crypto from "crypto";

export const adsRoute = express.Router()

adsRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };

    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const { wsKeys } = ClientManager.getClient(sessionData.userId)

    const obj = {
        title: "Werbung",
        css: "/css/obs_docks/ads/ads.css",
        showBody: true,
        username: sessionData.username,
        img: sessionData.profilePicture,
        type: 'OBS Dock Link',
        back: `http://localhost:3000/ads/${wsKeys.obsDocksKeys.ads}/renew`,
        link: `https://scaletta.live/ads/${wsKeys.obsDocksKeys.ads}`,
        helpLink: "https://scaletta.live/obsdocks#help"
    };
    res.render("main/obs_docks/ads/ads.ejs", obj)

})

adsRoute.get("/:key", async (req, res) => {
    const key = req.params.key
    const obj = {
        title: "OBS DOCK ADS",
        css: "/css/obs_docks/ads/ads-dock.css",
        showBody: false,
        targetUser: key
    };
    res.render("main/obs_docks/ads/ads-dock.ejs", obj)
})

adsRoute.get("/:key/renew", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const newKey = crypto.randomBytes(64).toString("hex");
        await Insert.obsDocks([sessionData.userId, "ads", newKey])
        await ClientManager.restartBot(sessionData.username, sessionData.userId, key)
    } catch (error) {
        console.log("Neuer Key kann nicht generiert werden " + error)
    }
    res.redirect("/ads")
})