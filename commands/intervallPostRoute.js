import client from "../src/redisClient.js";
import { Select, Insert, Delete } from "../sql/sqlHandler.js"

import express from "express"
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
                    intervallName:DB[index].category,
                    text: DB[index].response_text,
                    intervall: DB[index].intervall,
                    state: DB[index].state
                }
            })   
        }
    }
    res.render("main/commands/intervall", obj)
})

intervallRoute.get("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const cookieKeys = Object.keys(req.cookies);

    for (let index = 0; index < cookieKeys.length; index++) {
        if (cookieKeys[index] != "cookie") {
            const cookie = JSON.parse(req.cookies[cookieKeys[index]])
            await Insert.CreateIntervall([sessionData.userId, cookie.intervallName, cookie.text, cookie.intervall, cookie.state]);
            res.cookie(cookieKeys[index], "", { maxAge: 0 });
        };
    };
    res.redirect("/intervall");
})

intervallRoute.get("/delete/:category", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    await Delete.Intervall([sessionData.userId, req.params.category])
    res.redirect("/intervall")
})