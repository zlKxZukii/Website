import express from "express";
export let commandsRoute = express.Router();
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";

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
            defaultCommand: {}
        };

        let DB = await Select.Commands([sessionData.userId]);

        // Create Commands firt time
        if (!DB || DB.length === 0) {
            const socialArray = [
                'Discord',
                'Facebook',
                'YouTube',
                'TikTok',
                'Instagram']
            const triggersArray = [
                ['!dc', '!discord'],
                ['!fb', '!facebook'],
                ['!yt', '!youtube'],
                ['!tt', '!tiktok'],
                ['!insta', '!instagram']];
            for (let index = 0; index < socialArray.length; index++) {
                await Insert.CreateDefCommands([sessionData.userId, socialArray[index], triggersArray[index]]);
            };
            return res.redirect("/commands");
        };

        // Send to Frontend
        for (let index = 0; index < DB.length; index++) {
            Object.assign(obj.defaultCommand, {
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
        res.render("main/commands/commands", obj);
    }
    catch (error) {
        console.log("Fehler in der Commands Route " + error.message);
    };
});


commandsRoute.get("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const cookieKeys = Object.keys(req.cookies)

    for (let index = 0; index < cookieKeys.length; index++) {
        if (cookieKeys[index] != "cookie") {
            const params = JSON.parse(req.cookies[cookieKeys[index]])
            if (params.cooldown < 0) {
                params.cooldown = 0
            }
            if (params.delay < 0) {
                params.delay = 0
            }
            await Insert.updateDefCommand([
                sessionData.userId,
                cookieKeys[index],
                params.value,
                params.cooldown,
                params.delay,
                params.state,
                params.stateTitle.anybody,
                params.stateTitle.broadcaster,
                params.stateTitle.moderator,
                params.stateTitle.subscriber,
                params.stateTitle.vip
            ]);
            res.cookie(cookieKeys[index], "", { maxAge: 0 })
        }

    }
    res.redirect("/commands");
})