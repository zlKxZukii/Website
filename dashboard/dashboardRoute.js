import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import express from "express"
import { getData } from "../src/firebase.js";
export let dashboardRoute = express.Router()

import { createApiClient } from '../twitch_bot/createAPIclient.js';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { getRandomInt } from "../randomizer/randomNumber.js";
import { getUsers } from "../sql/getData.js";

dashboardRoute.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator
    console.log(await getUsers(2))
    if (await getUsers(2) != []) {
        
        const username = req.signedCookies.username || "";
        const img = req.signedCookies.profilePic || "";
        const parent = process.env.PARENT

        const tokenData = await getData("tokens", username, userID)
        const authProviderComp = await getAuthProvider(tokenData)
        const apiClient = await createApiClient(authProviderComp)

        const get = await getData("botState", username, userID)
        const obj = {
            title: "Dashboard",
            css: "../css/dashboard/dashboard.css",
            username: username,
            img: img,
            parent: parent,
            showBody: true
        }

        if (get.state) {
            Object.assign(obj, { botState: "true" })
        }
        else {
            Object.assign(obj, { botState: "false" })
        }

        Object.assign(obj, await getBroadcasterInfo(userID, apiClient))
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