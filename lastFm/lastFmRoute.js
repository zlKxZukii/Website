import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import axios from "axios";
import express from "express";
import client from "../src/redisClient.js";
import crypto from "crypto";
import { Auth, Insert, Select } from "../sql/sqlHandler.js";
import { io } from "../src/server.js";
import { ClientManager } from "../twitch_bot/connectBot.js";

export const LastFmRoute = express.Router()

LastFmRoute.get("/auth", async (req, res) => {
    const apiKey = process.env.LASTFM_API_KEY;
    const callbackUrl = encodeURIComponent(process.env.LASTFM_REDIRECT_URL);

    res.redirect(`http://www.last.fm/api/auth/?api_key=${apiKey}&cb=${callbackUrl}`)
})

LastFmRoute.get("/auth/callback", async (req, res) => {
    const loginKey = req.signedCookies.access_validator
    const token = req.query.token;
    const apiKey = process.env.LASTFM_API_KEY;
    const apiSecret = process.env.LASTFM_API_SECRET;


    if (!token) return res.redirect('/error');

    const sigString = `api_key${apiKey}methodauth.getSessiontoken${token}${apiSecret}`;
    const apiSig = crypto.createHash('md5').update(sigString, 'utf8').digest('hex');
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
        params: {
            method: 'auth.getSession',
            token: token,
            api_key: apiKey,
            api_sig: apiSig,
            format: 'json'
        }
    })
    const wsKey = crypto.randomBytes(64).toString("base64url");
    const { twitch_id, username } = await Select.GetUserByKey([loginKey])
    const { key, name } = response.data.session

    await Auth.CreateLastFmUser([twitch_id, name, key, wsKey])

    res.redirect(`/lastfm`)
})

LastFmRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const DB = await Select.LastFmUserById([sessionData.userId])
    const lastFmObj = {
        title: "Last FM Player",
        css: "../css/lastfm/page.css",
        showBody: true,
        showSettings: false,
        type: "Last FM Player",
        username: sessionData.username,
        img: sessionData.profilePicture,
        helpLink: 'https://scaletta.live/browsertools',
        link: null,
        change: "",
        settings: {}
    };
    if (DB) {
        lastFmObj.settings = DB.settings
        lastFmObj.showSettings = true,
            lastFmObj.link = `https://scaletta.live/lastfm/player/${DB.websocket_key}`
    }
    // change setzen!

    res.render("main/lastFm/lastFm", lastFmObj);
});

LastFmRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)
    const data = req.body

    if (user) {
        user.lastFM.settings = data
    }
    Insert.UpdateLastFmSettings([sessionData.userId, data])
    res.json({ message: 'OK' })
})

LastFmRoute.get("/player/:key", async (req, res) => {
    const { username, session_key, settings } = await Select.LastFmUserByWsKey([req.params.key])
    console.log(settings)
    const playerObj = {
        title: "LAST FM PLAYER",
        css: "/css/lastfm/player.css",
        showBody: false,
        username,
        sessionKey: session_key,
        barTop: settings.barTop,
        rotation: settings.rotation,
        barBottom: settings.barBottom,
        barMiddle: settings.barMiddle,
        fontColor: settings.fontColor,
        targetUser: req.params.key
    }
    res.render("main/lastFm/player", playerObj);
})

LastFmRoute.post("/music/:key", async (req, res) => {
    const apiKey = process.env.LASTFM_API_KEY;
    const secret = process.env.LASTFM_API_SECRET;
    const wsKey = req.params.key;
    const { username } = req.body;
    try {
        const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'user.getRecentTracks',
                user: username,
                api_key: apiKey,
                format: 'json',
                limit: 1
            }
        });
        const data = response.data.recenttracks.track[0];
        const songInfo = {
            artist: data.artist['#text'],
            img: data.image[2]['#text'],
            album: data.album['#text'],
            track: data.name,
            nowPlaying: null,
        };
        console.log(data)

        if (data['@attr']) {
            songInfo.nowPlaying = data['@attr'].nowplaying
        };

        io.to(wsKey).emit('song', songInfo);
        res.json({ message: 'OK' });
    } catch (error) {
        res.json({message:'retry'})
        console.log("Fehler bei Last FM Musik Abfrage: ", error)
    }
})