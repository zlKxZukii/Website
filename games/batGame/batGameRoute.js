import express from "express"
import client from "../../src/redisClient.js";
import { Insert, Select } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
export const batGameRoute = express.Router()

batGameRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const DB = await Select.GetGames([sessionData.userId]);
        const obj = {
            css: "../../css/games/batGame/bat-game.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            link: `https://scaletta.live/games/${DB[0].key}`,
            title: "Flattermann",
            type: "Spiele",
            helpLink: 'https://scaletta.live/games',
            showBody: true,
            pathColor: null,
            wallColor: null
        };
        for (const game of DB) {
            if (game.game === 'Bat') {
                obj.pathColor = game.settings.pathColor
                obj.wallColor = game.settings.wallColor
                Object.assign(obj, {
                    state: game.state,
                    duration: game.settings.duration
                })
            };
        }
        res.render("main/games/batGame/batGame.ejs", obj)
    }
    catch (error) {
        console.log(error);
        res.redirect("/");
    };
})

batGameRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        const { wallColor, pathColor, duration, state } = req.body;
        const settings = {
            wallColor, pathColor, duration
        }
        await Insert.UpdateGame([sessionData.userId, "Bat", settings, state])
        user.games.Bat.state = state
        user.games.Bat.settings = state
    } catch (error) {
        console.log("Fehler beim Speichern von BatGame: ", error)
    }
    res.redirect("/bat")
})