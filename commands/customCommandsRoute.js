import express from "express"
export let customCommandsRoute = express.Router()
import client from "../src/redisClient.js";
import { Select, Insert, Delete } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";

customCommandsRoute.get((""), async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const obj = {
        title: "Custom Befehle",
        css: "../css/commands/custom-commands.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        showBody: true,
        customCommandData: {}
    };

    const DB = await Select.CustomCommand([sessionData.userId])
    //Sende ans frontend
    for (let index = 0; index < DB.length; index++) {
        Object.assign(obj.customCommandData, {
            [DB[index].category]: {
                response_text: DB[index].response_text,
                cooldown: DB[index].cooldown,
                delay: DB[index].delay,
                state: DB[index].state,
                triggers: DB[index].triggers,
                stateTitle: {
                    anybody: DB[index].anybody,
                    broadcaster: DB[index].broadcaster,
                    vip: DB[index].vip,
                    subscriber: DB[index].subscriber,
                    moderator: DB[index].moderator
                }
            }
        })

    }
    res.render("main/commands/customCommands", obj);
});

customCommandsRoute.get("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const cookieKeys = Object.keys(req.cookies)

    for (let index = 0; index < cookieKeys.length; index++) {
        if (cookieKeys[index] != "cookie") {
            // Länge bestimmen für zuweisunge zwischen create und Update
            if (Object.keys(JSON.parse(req.cookies[cookieKeys[index]])).length < 5) {
                const params = JSON.parse(req.cookies[cookieKeys[index]])
                await Insert.CreateCustomCommands([sessionData.userId, params.category, params.response_text, params.triggers])
            }
            else {
                const params = JSON.parse(req.cookies[cookieKeys[index]])
                if (params.cooldown < 0) {
                    params.cooldown = 0
                }
                if (params.delay < 0) {
                    params.delay = 0
                }
                await Insert.UpdateCustomCommands([
                    sessionData.userId,
                    params.category,
                    params.response_text,
                    params.cooldown,
                    params.delay,
                    params.state,
                    params.stateTitle.anybody,
                    params.stateTitle.broadcaster,
                    params.stateTitle.moderator,
                    params.stateTitle.subscriber,
                    params.stateTitle.vip])
            }
            res.cookie(cookieKeys[index], "", { maxAge: 0 })
        }
    }
    ClientManager.restartBot(sessionData.username, sessionData.userId, key)
    res.redirect("/customcommands")

})

customCommandsRoute.get("/delete/:category", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const category = req.params.category
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    await Delete.CustomCommands([sessionData.userId, category])
    
    ClientManager.restartBot(sessionData.username, sessionData.userId, key)
    res.redirect("/customcommands")
})