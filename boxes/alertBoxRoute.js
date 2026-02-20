import express from "express"
export let alertBoxRoute = express.Router()

import { getData } from "../src/firebase.js";

alertBoxRoute.get("/", async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";
    if (!userID) {
        res.redirect("/?index=true")
    }
    else {
        const DB = await getData("alertBox", username, userID)
        const obj = {
            alertLink: `https://scaletta.live/alertbox/${DB.key}`,
            css: "../../css/boxes/alert-box-route.css",
            username: username,
            img: img,
            title: "Alert Box",
            showBody: true,
            back: "alertbox"
        }
        res.render("main/boxes/alertBoxRoute.ejs", obj)
    }
})

export let followBoxRoute = express.Router()

followBoxRoute.get("/", async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";
    if (!userID) {
        res.redirect("/nono")
    }
    else {
        const DB = await getData("alertBox", username, userID)
        const obj = {
            alertLink: `https://scaletta.live/alertbox/${DB.key}`,
            css: "../../css/boxes/alert-box-route.css",
            username: username,
            img: img,
            title: "Follow Box",
            showBody: true,
            back: "followbox"
        }
        res.render("main/boxes/followBoxRoute.ejs", obj)
    }
})

export const alertBox = express.Router()

alertBox.get("/:userkey", async (req, res) => {
    const user = req.params.userkey
    const obj = {
        title: "AlertBox",
        css: "../../css/boxes/alert-box.css",
        showBody: false,
        targetUser: user
    }
    res.render("main/boxes/alertBox.ejs", obj)
})