import express from "express"
export let jokesRoute = express.Router()

import client from "../src/redisClient.js";
import { getJokeDataForUser, getAllJokes } from "../sql/getData.js";
import { jokeState } from "../sql/insertFunctions.js";

// Standard Route
jokesRoute.get("", async (req, res) => {
    const key = req.signedCookies.access_validator;

    if (!key) {
        return res.redirect("/?index=true")
    }
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const jokeDB = await getJokeDataForUser(sessionData.userId)
        const randomArray = ['Chuck Norris Witze', 'Deine Mutter Witze', 'Tier Witze', 'Flach Witze'];

        const obj = {
            title: "Witze",
            css: "css/commands/jokes.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            showBody: true,
            jokeData: {}
        }
        if (!jokeDB) {
            for (const element of randomArray) {

                await jokeState(sessionData.userId, element)
            };
            return res.redirect("/jokes")
        }
        for (let index = 0; index < randomArray.length; index++) {
            const key = randomArray[index].split(" ").join("")
            Object.assign(obj.jokeData, {
                [key]: {
                    trigger: jokeDB[index].triggers,
                    category: randomArray[index],
                    id: randomArray[index].toLowerCase(),
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
                await jokeState(sessionData.userId, element.split("_").join(" "), req.cookies[element])
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
        const category = req.params.category
        const DB = await getAllJokes(category)
        if (DB.length < 1) {
            return res.redirect("/nono")
        }
        console.log(DB.length)
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