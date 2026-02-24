import express from "express"
export let jokesRoute = express.Router()

import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";

// Standard Route
jokesRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true")
    }
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const jokeDB = await Select.JokeDataForUser([sessionData.userId])
        
        const obj = {
            title: "Witze",
            css: "css/commands/jokes.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            showBody: true,
            jokeData: {}
        }

        if (!jokeDB) {
            const jokeArray = ['Chuck Norris Witze', 'Deine Mutter Witze', 'Tier Witze', 'Flach Witze'];
            for (const element of jokeArray) {

                await Insert.jokeState(sessionData.userId, element)
            };
            return res.redirect("/jokes")
        }
        for (let index = 0; index < jokeDB.length; index++) {
            Object.assign(obj.jokeData, {
                [jokeDB[index].category.split(" ").join("")]: {
                    trigger: jokeDB[index].triggers,
                    category: jokeDB[index].category,
                    id: jokeDB[index].category.split(" ").join("").toLowerCase(),
                    state: jokeDB[index].state
                }
            })
        }

        res.render("main/commands/jokes", obj)
    }
    catch (error) {
        console.log(error)
    }
})

// Route für Speichern der States
jokesRoute.get("/save", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true")
    }
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const cookieKey = Object.keys(req.cookies)
        // insert Statements
        for (const element of cookieKey) {
            if (element != "cookie") {
                await Insert.jokeState(sessionData.userId, element.split("_").join(" "), req.cookies[element])
                res.cookie(element, "", { maxAge: 0 })
            }
        }
        res.redirect("/jokes")

    } catch (error) {
        console.log(error)
        res.redirect("/")
    }
})

// Route für eine Liste
jokesRoute.get("/:category", async (req, res) => {
    const key = req.signedCookies.access_validator;
    try {
        const DB = await Select.AllJokes([category])
        if (DB.length < 1) {
            return res.redirect("/nono")
        }
        const category = req.params.category

        const obj = {
            title: `Witze: ${category}`,
            css: "/css/commands/joke-list.css",
            jokes: {},
            showBody: true
        }

        for (let index = 0; index < DB.length; index++) {
            Object.assign(obj.jokes, {
                [index + 1]: {
                    prompt: DB[index].response_text
                }
            })
        }

        if (key) {
            const sessionData = JSON.parse(await client.get(`sess:${key}`));
            Object.assign(obj, {
                username: sessionData.username,
                img: sessionData.profilePicture,
            })
        }
        res.render("main/commands/joke-list", obj)
    } catch (error) {
        console.log(error)
    }
})