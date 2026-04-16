import express from "express"
import { spotifyApi } from "../../src/server.js";
import client from "../../src/redisClient.js";
import { Select, Insert } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";

export let SpotifyAuthRoute = express.Router()

SpotifyAuthRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const scopes = ['user-read-currently-playing', 'playlist-modify-public', 'playlist-read-private', 'playlist-modify-private'];
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
        res.redirect(authorizeURL);
    } catch (error) {
        console.log(error)
    }
})

SpotifyAuthRoute.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);

        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);


    } catch (error) {

    }
})