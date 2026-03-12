import express from "express"
import client from "../src/redisClient.js";
export const test = express.Router()

test.get("/", async (req, res) => {
    // const key = req.signedCookies.access_validator;

    // if (!key) {
    //     return res.redirect("/?index=true");
    // };
    // const sessionData = JSON.parse(await client.get(`sess:${key}`));
    
    const obj = {
        title: "Werkzeuge",
        showBody:true
    };
    // res.redirect(`ads/${key}`)
    res.render("main/test.ejs", obj)
})