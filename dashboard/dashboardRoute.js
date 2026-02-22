import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express";
export let dashboardRoute = express.Router();

import { createApiClient } from '../twitch_bot/createAPIclient.js';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { getRandomInt } from "../randomizer/randomNumber.js";
import { getUsers, getToken } from "../sql/getData.js";
import client from "../src/redisClient.js";

dashboardRoute.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (key) {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const userId = sessionData.userId
        const user = await getUsers(key)
        const tokenData = await getToken(sessionData.userId);
        const authProviderComp = await getAuthProvider(tokenData);
        const apiClient = await createApiClient(authProviderComp);

        const obj = {
            title: "Dashboard",
            css: "../css/dashboard/dashboard.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            parent: process.env.PARENT,
            showBody: true,
            botState: user.bot_state
        };

        Object.assign(obj, await getBroadcasterInfo(userId, apiClient))
        res.render("main/dashboard/dashboard", obj)
    } else {
        res.redirect("/?index=true")
    }
})

async function getBroadcasterInfo(userID, apiClient) {
    const workObj = {}
    Object.assign(workObj, await getClips(userID, apiClient))
    Object.assign(workObj, await getProminenceInformation(userID, apiClient))
    return workObj
}

async function getClips(userID, apiClient) {
    let clips = await apiClient.clips.getClipsForBroadcaster(userID, { limit: 100 })

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