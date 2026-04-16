import express from "express"
import { spotifyApi } from "../../src/server.js";
import client from "../../src/redisClient.js";
import { Select, Insert } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";

export const SpotifyRoute = express.Router()

SpotifyRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/index=true")
    };
    const spotifyObj = {
        title: "Spotify",
        css: "../css/index.css",
        showBody: true,
        username: null,
        img: null
    };

    res.render("main/spotify/spotify", spotifyObj);
});