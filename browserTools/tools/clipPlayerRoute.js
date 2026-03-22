import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express"
import client from "../../src/redisClient.js";
import { Select, Insert } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
import crypto from "crypto";
import { getRandomInt } from "../../randomizer/randomNumber.js";
import { io } from "../../src/server.js";

export const clipPlayerRoute = express.Router()

clipPlayerRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        let clipKey = ""
        if (!user) {
            const DB = await Select.GetBrowserToolsKey([sessionData.userId])
            for (const tool of DB) {
                if (tool.type === "ClipBox") {
                    clipKey = tool.key
                }
            }
        }
        else {
            clipKey = user.browserKeys.ClipBox
        }
        const obj = {
            css: "../../css/boxes/help.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            title: "Clip Player",
            showBody: true,
            boxes: 'Clip Player',
            helpLink: 'https://scaletta.live/browsertools',
            link: `https://scaletta.live/clipsplayer/${clipKey}`
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
        showBody: false,
        parent: process.env.PARENT
    };

    res.render("main/browserTools/websocket/clipPlayer.ejs", obj)
})

clipPlayerRoute.post('/getclip', async (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.json({ send: "netter Versuch" })
    }

    const { twitch_id, username }=await Select.GetUserIdFromTools([key])
    const user = ClientManager.getClient(twitch_id)

    const clip = await getClips(twitch_id, user.apiClient)

    io.to(key).emit("newClip", {
        id: clip.clipId.id,
        duration: clip.clipId.duration,
        parent: process.env.PARENT,
        channel: username
    })
    res.redirect(`/clipsplayer/${key}`)
})

async function getClips(userID, apiClient) {
    const clips = await apiClient.clips.getClipsForBroadcaster(userID, { limit: 100 })

    if (clips.data.length != 0) {
        return { clipId: clips.data[getRandomInt(clips.data.length)] }
    }
    else {
        return { clipId: "CloudySarcasticSashimiTwitchRPG" }
    }
}