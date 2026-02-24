import express from "express"
import client from "../src/redisClient.js"
export let dataSecureRoute = express.Router()


dataSecureRoute.get((""), async (req, res) => {
    const obj = {
        title: "Datenschutz",
        css: "../css/legally/data_secure.css",
        showBody: true
    }

    const key = req.signedCookies.access_validator;
    if (key) {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        Object.assign(obj, {
            username: sessionData.username,
            img: sessionData.profilePicture
        })
    }


    res.render("main/legally/dataSecure.ejs", obj)

})

export let impressumRoute = express.Router()

impressumRoute.get((""), async (req, res) => {

    const obj = {
        title: "Impressum",
        css: "../css/legally/impressum.css",
        showBody: true
    }

    const key = req.signedCookies.access_validator;
    if (key) {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        Object.assign(obj, {
            username: sessionData.username,
            img: sessionData.profilePicture
        })
    }

    res.render("main/legally/impressum.ejs", obj)

})