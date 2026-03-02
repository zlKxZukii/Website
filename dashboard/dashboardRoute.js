import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express";
export let dashboardRoute = express.Router();

import { createApiClient } from '../twitch_bot/createAPIclient.js';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { getRandomInt } from "../randomizer/randomNumber.js";
import { Select } from "../sql/sqlHandler.js";
import client from "../src/redisClient.js";
import { ClientManager } from "../twitch_bot/connectBot.js";



dashboardRoute.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        res.redirect("/?index=true")
    }

    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const userId = sessionData.userId
    const user = await Select.Users(['bot_state'], [key])
    const tokenData = await Select.Token([sessionData.userId]);

    const obj = {
        title: "Dashboard",
        css: "../css/dashboard/dashboard.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        parent: process.env.PARENT,
        showBody: true,
        botState: user.bot_state
    };

    Object.assign(obj, await getBroadcasterInfo(userId, tokenData))


    async function getBroadcasterInfo(userID, tokenData) {
        const authProviderComp = await getAuthProvider(tokenData);
        const apiClient = await createApiClient(authProviderComp);
        const workObj = {}
        Object.assign(workObj, await getClips(userID, apiClient))
        Object.assign(workObj, await getProminenceInformation(userID, apiClient))
        return workObj
    }

    async function getClips(userID, apiClient) {
        const clips = await apiClient.clips.getClipsForBroadcaster(userID, { limit: 100 })

        if (clips.data.length != 0) {
            let randInt = getRandomInt(clips.data.length)
            if (randInt == clips.data.length) {
                randInt -= 1
            }
            return { clipID: clips.data[randInt].id }
        }
        else {
            return { clipID: "CloudySarcasticSashimiTwitchRPG" }
        }
    }

    async function getProminenceInformation(userID, apiClient) {
        const follower = await apiClient.channels.getChannelFollowers(userID)
        const subs = await apiClient.subscriptions.getSubscriptions(userID)
        const bits = await apiClient.bits.getLeaderboard(userID)
        return {
            follower: follower.total,
            subscriber: subs.total,
            bits: bits.totalCount
        }
    }

    res.render("main/dashboard/dashboard", obj)

})

dashboardRoute.get("/bot/:state", async (req, res) => {
    const key = req.signedCookies.access_validator;
    const sessionData = await JSON.parse(await client.get(`sess:${key}`));
    const userID = sessionData.userId
    const username = sessionData.username

    const params = req.params
    if (params.state === 'activate') {
        await ClientManager.start(username, userID)
    }
    if (params.state === 'deactivate') {
        await ClientManager.disconnect(userID)
    }
    res.redirect("/dashboard")
})