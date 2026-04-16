import client from "../src/redisClient.js";
import { Select, Insert, Delete } from "../sql/sqlHandler.js"

import express from "express"
import { ClientManager } from "../twitch_bot/connectBot.js";
export const intervallRoute = express.Router()

intervallRoute.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const obj = {
        title: `Intervall`,
        css: "css/commands/intervall.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        showBody: true,
        data: {}
    }

    const DB = await Select.Intervall([sessionData.userId])
    if (DB) {
        for (let index = 0; index < DB.length; index++) {
            Object.assign(obj.data, {
                [DB[index].category]: {
                    intervallName: DB[index].category,
                    text: DB[index].response_text,
                    intervall: DB[index].intervall,
                    state: DB[index].state
                }
            })
        }
    }
    res.render("main/commands/intervall", obj)
})

intervallRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)
    const bodyKeys = Object.keys(req.body)
    for (const key of bodyKeys) {
        const { text, intervall, state, intervallName } = req.body[key]

        if (user.intervallList[intervallName]) {
            clearInterval(user.intervallList[intervallName]);
            delete user.intervallList[intervallName];
        }
        if (state) {
            Object.assign(user.intervallList, {
                [intervallName]: setInterval(() => {
                    user.chatClient.say(sessionData.username, text)
                }, intervall * 1000)
            })
        };

        await Insert.CreateIntervall([sessionData.userId, intervallName, text, intervall, state])
    }
    res.redirect("/intervall");
})

intervallRoute.post("/delete", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const keys = Object.keys(req.body)
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)

    await Delete.Intervall([sessionData.userId, req.body[keys]])

    res.redirect("/intervall")
})

