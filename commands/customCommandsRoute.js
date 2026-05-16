import express from "express"
export let customCommandsRoute = express.Router()
import client from "../src/redisClient.js";
import { Select, Insert, Delete } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import chalk from "chalk";

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
        });
    };
    res.render("main/commands/customCommands", obj);
});

customCommandsRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        const keys = Object.keys(req.body)
        for (let index = 0; index < keys.length; index++) {
            const { category, response_text, state, stateTitle } = req.body[keys[index]]
            let { cooldown, delay } = req.body[keys[index]]
            if (cooldown < 0) {
                cooldown = 0
            }
            if (delay < 0) {
                delay = 0
            }
            // Update DB
            try {
                await Insert.UpdateCustomCommands([
                    sessionData.userId,
                    category,
                    response_text,
                    cooldown,
                    delay,
                    state,
                    stateTitle.anybody,
                    stateTitle.broadcaster,
                    stateTitle.moderator,
                    stateTitle.subscriber,
                    stateTitle.vip])

            } catch (error) {
                console.log(error)
            }

            // Update user
            if (user) {
                try {
                    for (const key in keys) {
                        if (user.customCommands[index].category === keys[key]) {
                            user.customCommands[index].response_text = response_text
                            user.customCommands[index].cooldown = cooldown
                            user.customCommands[index].delay = delay
                            user.customCommands[index].state = state
                            user.customCommands[index].anybody = stateTitle.anybody
                            user.customCommands[index].broadcaster = stateTitle.broadcaster
                            user.customCommands[index].moderator = stateTitle.moderator
                            user.customCommands[index].subscriber = stateTitle.subscriber
                            user.customCommands[index].vip = stateTitle.vip
                        }
                    }
                } catch (error) {
                    console.log('User ', error)
                }
            }

        }
        res.redirect("/customcommands");
    } catch (error) {
        console.log(chalk.red("Fehler beim Speichern eines Custom Commands " + error.message))
    };
});

customCommandsRoute.post("/create", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {

        const { category, responseText, triggers } = req.body
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        user.customCommands.push({
            category: category,
            response_text: responseText,
            cooldown: 0,
            triggers: triggers,
            delay: 0,
            state: true,
            anybody: true,
            broadcaster: true,
            moderator: true,
            subscriber: true,
            vip: true
        })
        console.log(triggers)
        await Insert.CreateCustomCommands([sessionData.userId, category, responseText, triggers])

    } catch (error) {
        console.log("Fehler beim erstellen des CustomCommands: " + error)
    }
    res.redirect("/customcommands")
})

customCommandsRoute.post("/delete", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const { category } = req.body;
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const user = ClientManager.getClient(sessionData.userId)
    for (const obj in user.customCommands) {
        if (category === user.customCommands[obj].category) {
            delete user.customCommands[obj]
        }
    }
    await Delete.CustomCommands([sessionData.userId, category]);
    res.redirect("/customcommands");
})