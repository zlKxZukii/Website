import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express"
export const clipPlayerRoute = express.Router()

import client from "../../src/redisClient.js";
import { Select, Insert } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
import { io } from "../../src/server.js";
import { ActionManager } from "../../ToolManager/Manager.js";

clipPlayerRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        let clipKey = user.browserKeys.ClipBox
        if (!user) {
            return res.redirect('/dashboard')
        }

        const obj = {
            css: "../../css/browserTools/clipPlayer/clip-player.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            title: "Clip Player",
            showBody: true,
            boxes: 'Clip Player',
            helpLink: 'https://scaletta.live/browsertools',
            link: `https://scaletta.live/clipsplayer/${clipKey}?autoplay=1&muted=1`,
            clipKey
        }
        if (user.clipBoxColors) {
            Object.assign(obj, {
                clip: user.clipBoxColors['Clip'],
                head: user.clipBoxColors['Head']
            })
        }
        res.render("main/browserTools/tools/clipPlayer.ejs", obj)
    } catch (error) {
        console.log(error)

    }
})

clipPlayerRoute.get('/:key', async (req, res) => {
    const obj = {
        css: "../../css/browserTools/websocket/clip-player.css",
        title: "CLIP PLAYER",
        targetUser: req.params.key,
        showBody: false
    };

    res.render("main/browserTools/websocket/clipPlayer.ejs", obj)
})

clipPlayerRoute.post('/getclip/:key', async (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.json({ send: "netter Versuch" })
    };

    const { twitch_id, username } = await Select.GetUserIdFromTools([key]);

    const user = ClientManager.getClient(twitch_id);
    const { video, duration, game, cover, cliper } = await ActionManager.initClipForBroadcaster(twitch_id, user.apiClient, user)

    io.to(key).emit("newClip", {
        video: video,
        duration: duration,
        game: game,
        cover: cover,
        cliper: cliper || username
    });
    res.redirect(`/clipsplayer/${key}`);
});

clipPlayerRoute.post('/save', async (req, res) => {
    const key = req.signedCookies.access_validator

    if (!key) {
        return res.json({ send: "netter Versuch" })
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId);
    const settings = {}
    const valArr = ['Head', 'Clip']
    for (const val of valArr) {
        const { color, x, y, blur, rgba, alpha } = req.body[val]
        Object.assign(settings, { [val]: { color, x, y, blur, rgba, alpha } })
        if (user.clipBoxColors === null) {
            user.clipBoxColors = {
                Head: "",
                Clip: ""
            }
        }
        user.clipBoxColors[val] = { x, y, blur, rgba, alpha, color }
    }
    await Insert.UpdateBrowserJSON([sessionData.userId, 'ClipBox', settings, req.body.key])
    res.redirect("/clipsplayer")
})