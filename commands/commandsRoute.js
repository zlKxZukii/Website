import express from "express";
export let commandsRoute = express.Router();
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";

const defaultCommandsObj = [
        { category: 'Discord', triggers: ['!dc', '!discord'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Facebook', triggers: ['!fb', '!facebook'], settings: { cooldown: 0, delay: 0 } },
        { category: 'YouTube', triggers: ['!yt', '!youtube'], settings: { cooldown: 0, delay: 0 } },
        { category: 'TikTok', triggers: ['!tt', '!tiktok'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Instagram', triggers: ['!insta', '!instagram'], settings: { cooldown: 0, delay: 0 } },
        { category: 'Clip', triggers: ['!clip'], settings: { clipLength: 30 } },
        { category: 'Shoutout', triggers: ['!so', '!sh', '!shoutout'], settings: { color: '#ffffff', sound: '../uploads/default/sound.mp3', font: '', positioning: '', extra: '' } }]


commandsRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };

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
            shoutOut: {}
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


commandsRoute.post("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    }
    const keys = Object.keys(req.body)
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const userId = sessionData.userId
    const user = await ClientManager.getClient(userId)
    for (let index = 0; index < keys.length; index++) {
        const userParams = user.defaultCommands[index]


        const { value, state, stateTitle } = req.body[keys[index]]
        const settings = {}
        const fields = ['cooldown', 'delay', 'clipLength', 'color', 'sound'];
        fields.forEach(field => {
            if (field in req.body[keys[index]]) settings[field] = req.body[keys[index]][field];
        });
        if ( userParams=== undefined) {
            Object.assign(user.defaultCommands, {
                category: keys[index],
                response_text: value,
                state: state,
                settings: settings,
                anybody: stateTitle.anybody,
                broadcaster: stateTitle.broadcaster,
                vip: stateTitle.vip,
                subscriber: stateTitle.subscriber,
                moderator: stateTitle.moderator
            })
        }
        // aktualisierung des CLients
        userParams.response_text = value;
        userParams.state = state;
        userParams.settings = settings;
        userParams.anybody = stateTitle.anybody;
        userParams.broadcaster = stateTitle.broadcaster;
        userParams.vip = stateTitle.vip;
        userParams.subscriber = stateTitle.subscriber;
        userParams.moderator = stateTitle.moderator;

        // aktualisierung der Datenbank
        await Insert.updateDefCommand([
            userId,
            keys[index],
            value,
            settings,
            state,
            stateTitle.anybody,
            stateTitle.broadcaster,
            stateTitle.moderator,
            stateTitle.subscriber,
            stateTitle.vip
        ]);
    }
    // wichtig redirecten
    res.redirect("/commands")
})