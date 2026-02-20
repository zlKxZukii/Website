import express from "express"
export let customCommandsRoute = express.Router()
import { getData } from "../src/firebase.js";

customCommandsRoute.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";

    if (!userID) {
        res.redirect("/?index=true")
    }

    else {
        const DB = await getData("customCommands", username, userID)
        const customKeys = Object.keys(DB)
        let obj = {
            title: "Custom Befehle",
            css: "../css/commands/custom-commands.css",
            username: username,
            img: img,
            keys: customKeys,
            showBody: true,
            customCommandData: {}
        }

        if (DB) {
            for (let index = 0; index < customKeys.length; index++) {
                Object.assign(obj.customCommandData, {[customKeys[index]]:[DB[customKeys[index]]]})
            }
        }

        res.render("main/commands/customCommands", obj)
    }
})