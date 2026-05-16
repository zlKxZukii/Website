import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express";
import client from "../src/redisClient.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import { Auth, Delete, Insert, Select } from "../sql/sqlHandler.js";

export const DiscordRoute = express.Router()

DiscordRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)

    const discordObj = {
        title: "Discord",
        css: "/css/discord/discord.css",
        showBody: true,
        username: sessionData.username,
        img: sessionData.profilePicture,
        webhookList: {}
    };
    if (!user) {
        const data = await Select.DiscordWebhooks([sessionData.userId])
        if (data.length > 0) {
            for (const index in data) {
                const { webhook, message_in, message_out, color } = data[index]
                Object.assign(discordObj.webhookList, {
                    [webhook]: {
                        messageIn: message_in,
                        messageOut: message_out,
                        color
                    }
                })
            }
        }
    }
    else {
        const data = user.discordWebhook
        const keys = Object.keys(user.discordWebhook)
        for (const key in keys) {
            const { messageIn, messageOut, color } = data[keys[key]]
            Object.assign(discordObj.webhookList, { [keys[key]]: { messageIn, messageOut, color } })
        }
    }
    console.log(discordObj.webhookList)
    res.render("main/discord/discord", discordObj);
})

DiscordRoute.post('/create', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const hook = req.body.hook;
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)

    const defStuff = {
        hook,
        messageIn: `${sessionData.username} ist jetzt Live!`,
        messageOut: `@everybody ${sessionData.username} ist jetzt Live!`,
        color: '#2bdffe'
    }

    if (user) {
        Object.assign(user.discordWebhook, {
            [defStuff.hook]: {
                messageIn: defStuff.messageIn,
                messageOut: defStuff.messageOut,
                color: defStuff.color
            }
        })
    }

    if (hook !== "") {
        await Auth.CreateDiscordWebhook([sessionData.userId, hook, defStuff.messageIn, defStuff.messageOut, defStuff.color])
    }
    res.json({ response: 'ok' })
})

DiscordRoute.post('/delete', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const hook = req.body.hook
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)

    if (user) {
        delete user.discordWebhook[hook]
    }
    await Delete.DiscordWebhook([hook])
    res.json({ response: 'ok' })
})

DiscordRoute.post('/save', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)
    const keys = Object.keys(req.body)
    try {
        for (const key of keys) {
            const data = req.body[key]
            if (user) {
                const DB = user.discordWebhook[key]
                DB.messageIn = data.messageIn
                DB.messageOut = data.messageOut
                DB.color = data.color
            }
            await Insert.UpdateDiscordWebhook([data.messageIn, data.messageOut, data.colorPicker, key])
        }
        res.json({ response: 'ok' })
    } catch (error) {
        console.log("Fehler beim Speichern der Discord Webhook data im Fetch.", error)
    }

})