import express from "express"
import { getData } from "../src/firebase.js";

export const intervallRoute = express.Router()

intervallRoute.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";
    if (!userID) {
        res.redirect("/?index=true")
    }
    else {
        const DB = await getData("intervalls", username, userID)
        const obj = {
            title: `Intervall`,
            css: "css/commands/intervall.css",
            username: username,
            img: img,
            showBody: true,
            data: JSON.stringify(DB)
        }
        res.render("main/commands/intervall", obj)
    }
})