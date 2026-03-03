import express from "express"
import client from "../../src/redisClient.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
export const adsRoute = express.Router()

adsRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };
    
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const {wsKeys} = ClientManager.getClient(sessionData.userId)
    
    const obj = {
        title: "Werbung",
        css: "/css/obs_docks/ads/ads.css",
        showBody: true,
        username: sessionData.username,
        img: sessionData.profilePicture,
        type:'OBS Dock Link',
        link: `https://scaletta.live/ads/${wsKeys.obsDocksKeys.ads}`,
        helpLink: "/obsdocks"
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