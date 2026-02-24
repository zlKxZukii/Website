import { Select, Insert } from "../sql/sqlHandler.js";
import client from "../src/redisClient.js";

import express from "express"
export const functionsRoute = express.Router()

functionsRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true")
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const DB = await Select.AccessShield([sessionData.userId])
    const obj = {
        title: `Funktionen`,
        css: "css/commands/functions.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        showBody: true,
        values: {}
    }
    for (let index = 0; index < DB.length; index++) {
        Object.assign(obj.values, { [DB[index].category]: DB[index].state })
    }
        console.log(obj)
    res.render("main/commands/functions", obj)
})

functionsRoute.get("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true")
    }
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    const accessKey = Object.keys(req.cookies)
    for (let index = 0; index < accessKey.length; index++) {
        if (accessKey[index] !== "cookie") {
            await Insert.AccessShield([sessionData.userId, accessKey[index], req.cookies[accessKey[index]]])
            res.cookie(accessKey[index], "", { maxAge: 0 })
        }

    }
    res.redirect("/functions")
})