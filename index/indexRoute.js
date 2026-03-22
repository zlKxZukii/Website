import express from "express";
export let indexRoute = express.Router();

import { randomJoke } from "../commands/jokeDB/jokeRandomizer.js";
import { randomSocialMedia } from "../randomizer/socialRandomizer.js";
import client from "../src/redisClient.js";
import chalk from "chalk";

indexRoute.get("", async (req, res) => {

    const key = req.signedCookies.access_validator;
    const indexObj = {
        title: "Start",
        css: "../css/index.css",
        showBody: true,
        username: null,
        img:null
    };

    Object.assign(indexObj, randomSocialMedia(), await randomJoke());

    if (key) {

        try {
            const rawData = await client.get(`sess:${key}`);
            if (rawData) {
                const sessionData = JSON.parse(rawData);
                indexObj.username = sessionData.username;
                indexObj.img = sessionData.profilePicture;
            }

        } catch (err) {
            console.log("Redis Fehler ignoriert");
        }
    };

    // ändern
    if (req.query.index === "true") {
        Object.assign(indexObj, {
            indexText: "Bitte erst anmelden."
        });
    };
    res.render("main/index.ejs", indexObj);
});

indexRoute.get("/logout", async (req, res) => {
    // abfrage ob überhaupt angemeldet
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/");
    };

    // löschen aller cookies und sessions für den perfekten logout
    try {
        const cookieArray = [Object.keys(req.signedCookies), Object.keys(req.cookies)].flat();
        for (const element of cookieArray) {
            res.clearCookie(element);
        };
        await client.del(`sess:${key}`)
    } catch (error) {
        console.log(chalk.red("cookies konnten nicht gelöscht werden " + error.message));
    };

    // rediertect zur startseite
    res.redirect("/");
});