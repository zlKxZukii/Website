import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import { ChatClient } from '@twurple/chat';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { createApiClient } from "./createAPIclient.js";
import { getData, saveData } from "../src/firebase.js";
import crypto from "crypto";
import { answers } from "./controller.js"

import { registerUserEvents } from "../twitch_bot/eventListener.js"

async function createBot(username, userID) {
    let alertKey = await getData("alertBox", username, userID)

    if (!alertKey.key) {
        const key = crypto.randomBytes(12).toString("hex");
        await saveData("alertBox", username, userID, { key: key })
        alertKey = await getData("alertBox", username, userID)
    }

    const tokenData = await getData("tokens", username, userID)
    const authProviderComp = await getAuthProvider(tokenData)
    const apiClient = await createApiClient(authProviderComp)

    const client = new ChatClient({
        authProvider: authProviderComp,
        channels: [username],
        requestMembershipEvents: true
    });

    client.onConnect(async () => {
        console.log(username + " connected")
    });

    client.onMessage(async (channel, user, message, msg) => {
        await answers(channel, user, message, msg, userID)
    })

    client.onDisconnect(((manually, reason) =>
        console.log(username, 'Disconnected:', manually)))
    return {
        client: client,
        key: alertKey.key,
        apiClient: apiClient
    }
}

class BotManager {
    constructor() {
        this.client = new Map();
    }

    async start(username, userID) {
        if (this.client.has(userID)) return;
        const { client, key, apiClient } = await createBot(username, userID);

        const wsListener = await registerUserEvents(username, userID, key, apiClient);
        const jokeState = await getData("jokes", username, userID) || {}
        const defaultCommands = await getDefaultCommands(username, userID) || {}
        const streamFunctionState = await streamFunctions(username, userID) || {}
        const customCommands = await getData("customCommands", username, userID) || {}
        const spamBotProtection = {}
        const intervallList = {}
        const DB = await getData("intervalls", username, userID)
        const DBKeys = Object.keys(DB)
        for (let index = 0; index < DBKeys.length; index++) {
            if (DB[DBKeys[index]].state) {
                Object.assign(intervallList, {
                    [DBKeys[index]]: setInterval(() => {
                        client.say(username, DB[DBKeys[index]].text)
                    }, Number(DB[DBKeys[index]].intervall) * 1000)
                })
            }
        }


        this.client.set(userID, { userID, client, username, key, apiClient, wsListener, jokeState, defaultCommands, streamFunctionState, customCommands, spamBotProtection, intervallList });
        await saveData("botState", username, userID, {
            state: true
        });

        await client.connect();
    }

    async disconnect(userID) {
        const data = this.client.get(userID);
        const { client, username, wsListener, intervallList } = data

        if (wsListener) {
            wsListener.stop();
        }
        
        Object.values(intervallList).forEach(clearInterval)

        await saveData("botState", username, userID, {
            state: false
        });

        if (!client) return;

        client.quit();
        this.client.delete(userID);

    }

    getClient(userID) {
        return this.client.get(userID);
    }
}

export const botManager = new BotManager()

export async function restartBot(username, userID) {
    const botState = await getData("botState", username, userID)
    if (botState.state) {
        await botManager.disconnect(userID)
        await botManager.start(username, userID)
    }
}

async function streamFunctions(username, userID) {
    let DB = await getData("streamFunctions", username, userID)
    if (!DB) {
        DB = {
            spamBot: "true",
            clip: "true",
            followBot: "true"
        }
        await saveData("streamFunctions", username, userID, DB)
    }
    return DB
}

async function getDefaultCommands(username, userID) {
    let DB = await getData("commands", username, userID)

    if (!DB) {
        const tagArr = ["discord", "facebook", "tiktok", "instagram", "youtube"]
        const triggerArr = {
            discord: ["!dc", "!discord"],
            facebook: ["!fb", "!facebook",],
            tiktok: ["!tt", "!tiktok"],
            instagram: ["!insta", "!instagram"],
            youtube: ["!yt", "!youtube"]

        }
        const obj = {}
        for (let index = 0; index < tagArr.length; index++) {
            Object.assign(obj, {
                [tagArr[index]]: {
                    state: false,
                    value: "",
                    stateTitle: {
                        anybody: false,
                        subscriber: false,
                        vip: false,
                        moderator: false,
                        broadcaster: false
                    },
                    cooldown: 0,
                    delay: 0,
                    trigger: triggerArr[tagArr[index]]
                }
            })
        }
        DB = obj
        await saveData("commands", username, userID, obj)
    }

    return DB
}