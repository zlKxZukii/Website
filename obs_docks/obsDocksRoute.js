import express from "express"
import client from "../src/redisClient.js";
export const obsDocks = express.Router()

obsDocks.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true");
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    
    const obj = {
        title: "Werkzeuge",
        css: "../css/obs_docks/docks.css",
        username: sessionData.username,
        img: sessionData.profilePicture,
        link:"hure",
        change: "obsdocks",
        showBody: true
    };
    // res.redirect(`ads/${key}`)
    res.render("main/obs_docks/obsDocks.ejs", obj)
})