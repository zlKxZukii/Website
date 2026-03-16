import express from "express";
export let commandsRoute = express.Router();
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";

commandsRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };

    const defaultCommandsObj = [
        { category: 'Discord', triggers: ['!dc', '!discord'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Facebook', triggers: ['!fb', '!facebook'], settings: { cooldown: 0, delay: 0 } },
        { category: 'YouTube', triggers: ['!yt', '!youtube'], settings: { cooldown: 0, delay: 0 } },
        { category: 'TikTok', triggers: ['!tt', '!tiktok'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Instagram', triggers: ['!insta', '!instagram'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Clip', triggers: ['!clip'], settings: { clipLength: 30 } },
        // { category: 'Shoutout', triggers: ['!so', '!sh', '!shoutout'], setting: {} }
    ]

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const obj = {
            title: "Commands",
            css: "../css/commands/commands.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            showBody: true,
            defaultCommand: {},
            clip: {},
            // shoutOut: {}
        };

        let DB = await Select.Commands([sessionData.userId]);

        const DBTester = DB.map(c => c.category)

        for (const entry of defaultCommandsObj) {
            if (!DBTester.includes(entry.category)) {
                await Insert.CreateDefCommands([sessionData.userId, entry.category, entry.triggers, entry.settings]);
            }

        }

        // Send to Frontend
        if (DB.length < defaultCommandsObj.length) {
            DB = await Select.Commands([sessionData.userId])
        }
        for (let index = 0; index < DB.length; index++) {
            Object.assign(obj.defaultCommand, {
                [DB[index].category]: {
                    response_text: DB[index].response_text,
                    settings: DB[index].settings,
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
        res.render("main/commands/commands", obj);
    }
    catch (error) {
        console.log("Fehler in der Commands Route " + error.message);
    };
});


commandsRoute.get("/save", async (req, res) => {
    console.log(req.cookies)
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const cookieKeys = Object.keys(req.cookies)

    for (let index = 0; index < cookieKeys.length; index++) {
        if (cookieKeys[index] != "cookie") {
            const params = JSON.parse(req.cookies[cookieKeys[index]])
            const settings = {}
            const fields = ['cooldown', 'delay', 'clipLength'];
            fields.forEach(field => {
                if (field in params) settings[field] = params[field];
            });

            await Insert.updateDefCommand([
                sessionData.userId,
                cookieKeys[index],
                params.value,
                settings,
                params.state,
                params.stateTitle.anybody,
                params.stateTitle.broadcaster,
                params.stateTitle.moderator,
                params.stateTitle.subscriber,
                params.stateTitle.vip
            ]);
            res.cookie(cookieKeys[index], "", { maxAge: 0 })
        }
        ClientManager.restartBot(sessionData.username, sessionData.userId, key)
    }
    res.redirect("/commands");
})