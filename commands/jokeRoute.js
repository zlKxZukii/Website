import express from "express"
export let jokesRoute = express.Router()

import animals from "./jokeDB/animals.json" with{type: "json"};
import chuckNorris from "./jokeDB/chuckNorris.json" with{type: "json"};
import deineMudda from "./jokeDB/deineMudda.json" with{type: "json"};
import flachWitz from "./jokeDB/flachWitze.json" with{type: "json"};
import { getData } from "../src/firebase.js";

jokesRoute.get((""), async (req, res) => {
    const userID = req.signedCookies.userID || "";
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";
    if (!userID) {
        res.redirect("/?index=true")
    }
    else if (req.query.list == "flachWitze") {
        const obj = {
            title: `Witze: ${req.query.list}`,
            css: "css/commands/joke-list.css",
            username: username,
            img: img,
            jokes: {},
            showBody: true
        }
        const keys = Object.keys(animals.jokes)
        for (let index = 0; index < keys.length; index++) {
            let value = animals.jokes[keys[index]]
            Object.assign(obj.jokes, { [keys[index]]: value })
        }
        res.render("main/commands/joke-list", obj)
    }
    else if (req.query.list == "animals") {
        let obj = {
            title: `Witze: ${req.query.list}`,
            css: "css/commands/joke-list.css",
            username: username,
            img: img,
            jokes: {},
            showBody: true
        }
        const keys = Object.keys(animals.jokes)
        for (let index = 0; index < keys.length; index++) {
            let value = animals.jokes[keys[index]]
            Object.assign(obj.jokes, { [keys[index]]: value })
        }
        res.render("main/commands/joke-list", obj)
    }
    else if (req.query.list == "chuckNorris") {
        let obj = {
            title: `Witze: ${req.query.list}`,
            css: "css/commands/joke-list.css",
            username: username,
            img: img,
            jokes: {},
            showBody: true
        }
        const keys = Object.keys(chuckNorris.jokes)
        for (let index = 0; index < keys.length; index++) {
            let value = chuckNorris.jokes[keys[index]]

            Object.assign(obj.jokes, { [keys[index]]: value })

        }
        res.render("main/commands/joke-list", obj)
    }
    else if (req.query.list == "deineMudda") {
        let obj = {
            title: `Witze: ${req.query.list}`,
            css: "css/commands/joke-list.css",
            username: username,
            img: img,
            jokes: {},
            showBody: true
        }
        const keys = Object.keys(deineMudda.jokes)
        for (let index = 0; index < keys.length; index++) {
            let value = deineMudda.jokes[keys[index]]

            Object.assign(obj.jokes, { [keys[index]]: value })

        }
        res.render("main/commands/joke-list", obj)
    }
    else {
        let obj = {
            title: "Witze",
            css: "css/commands/jokes.css",
            username: username,
            img: img,
            showBody: true
        }
        const jokeDB = await getData("jokes", username, userID)
        const jokeKeys = Object.keys(jokeDB)
        for (let i = 0; i < jokeKeys.length; i++) {
            if (jokeDB[jokeKeys[i]].state === "true") {
                Object.assign(obj, { [jokeKeys[i].toLowerCase() + "inp"]: "checked" })
            }   
        }
        const jokeArray = [animals, chuckNorris, deineMudda, flachWitz]
        let workArray = []
        for (let jokeMasterIndex = 0; jokeMasterIndex < jokeArray.length; jokeMasterIndex++) {
            let jokeMasterKeys = Object.keys(jokeArray[jokeMasterIndex].trigger)
            for (let jokePromptIndex = 0; jokePromptIndex < jokeMasterKeys.length; jokePromptIndex++) {
                workArray.push(jokeArray[jokeMasterIndex].trigger[jokePromptIndex])
                jokeArray[jokeMasterIndex][jokePromptIndex]
            }
            Object.assign(obj, { [jokeArray[jokeMasterIndex].title]: workArray, ["title" + jokeArray[jokeMasterIndex].title]: jokeArray[jokeMasterIndex].title })
            workArray = []
        }
        res.render("main/commands/jokes", obj)
    }
})