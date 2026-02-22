import express from "express";
export let indexRoute = express.Router();

import { randomJoke } from "../commands/jokeDB/jokeRandomizer.js";
import { randomSocialMedia } from "../randomizer/socialRandomizer.js";
import client from "../src/redisClient.js";

indexRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;

    const indexObj = {
        title: "Start",
        css: "../css/index.css",
        showBody: true
    };

    Object.assign(indexObj, randomSocialMedia(), await randomJoke());

    if (key) {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        Object.assign(indexObj, {
            username: sessionData.username,
            img: sessionData.profilePicture
        });
    };

    // ändern
    if (req.query.index === "true") {
        Object.assign(indexObj, {
            indexText: "Bitte erst anmelden."
        });
    };
    res.render("main/index.ejs", indexObj);
});