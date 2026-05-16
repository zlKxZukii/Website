import express from "express"
import { spotifyApi } from "../../src/server.js";
import client from "../../src/redisClient.js";
import { Select, Insert, Auth } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
import chalk from "chalk";
import crypto from "crypto";

export let SpotifyAuthRoute = express.Router()

SpotifyAuthRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const { userId } = JSON.parse(await client.get(`sess:${key}`));
        const scopes = [
            'streaming',
            'app-remote-control',
            'user-read-currently-playing',
            'user-read-playback-state',
            'playlist-modify-public',
            'playlist-read-private',
            'playlist-modify-private'
        ];
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes, userId);
        res.redirect(authorizeURL);
    } catch (error) {
        console.log(error)
    }
})

SpotifyAuthRoute.get('/callback', async (req, res) => {
    const code = req.query.code;
    const twitchId = req.query.state
    try {
        const DB = await Select.SpotifyKey([twitchId])
        if (!DB) {

            const key = crypto.randomBytes(64).toString("base64url");
            await Auth.CreateSpotifyKey([twitchId, key])
        }
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body
        try {
            await Auth.CreateSpotifyUser([twitchId, access_token, refresh_token, expires_in])
        } catch (error) {
            console.log("Datenbankeintrag konnte nicht erstellt werden.")
        }
        res.redirect('/spotify')
    } catch (error) {
        console.log(chalk.red("Spotify konnte nicht authorisiert werden.", error))
    }
})