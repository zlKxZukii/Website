import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import requestIP from "request-ip"

import { scopes } from "./scopes.js";

import express from "express"
export let auth = express.Router()

auth.get("", (req, res) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        scope: scopes.join(' ')
    })
    res.redirect(
        `https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
});

export const twitch = express.Router()
import { authTwitch } from "./createRefreshToken.js"

twitch.get("", requestIP.mw(), async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        console.log(error)
        return res.redirect("/auth");
    }
    if (!code) {
        console.log("no or invalid code")
        return res.redirect("/auth");
    }

    try {
        const ipAddress = req.clientIp
        await authTwitch(code, ipAddress, res);
        return res.redirect("/");
    } catch (err) {
        console.log(err)
        return res.redirect("/auth");
    }
});