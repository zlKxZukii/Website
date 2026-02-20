import { botManager } from "./connectBot.js";
import { messageProtection } from "./functions/spamProtection.js";
import { clip } from "./functions/clips.js";
import animals from "../commands/jokeDB/animals.json" with{type: "json"};
import chuckNorris from "../commands/jokeDB/chuckNorris.json" with{type: "json"};
import deineMudda from "../commands/jokeDB/deineMudda.json" with{type: "json"};
import flachWitze from "../commands/jokeDB/flachWitze.json" with{type: "json"};
import { getRandomInt } from "../randomizer/randomNumber.js";
// import { io } from "../src/server.js";

const tagArray = ["broadcaster", "subscriber", "vip", "moderator", "anybody"];

export async function answers(channel, user, message, msg, userID) {
    
    const client = botManager.getClient(userID)
    const permission = readTags(msg)
    await chatProtection(client, msg.userInfo, client.apiClient, message)
    await chatFunctions(client, message)
    defaultCommandsOutput(client, message, permission)
    customCommandsOutput(client, message, permission)
    jokeOutput(client, message)
    //funktioniert aber soll erst später eingebunden werden 
    // commandListOutput(client, userID, message, channel)
}

async function chatProtection(client, user, apiClient, message) {

    if (client.streamFunctionState.spamBot === "true") {
        await messageProtection(client, user, apiClient, message)
    }
}

async function chatFunctions(client, message) {
    if (client.streamFunctionState.clip === "true" && message === "!clip") {
        await clip(client.username, client.userID, client.apiClient, client.client)
    }
}

function defaultCommandsOutput(client, message, permission) {
    const dbKeys = Object.keys(client.defaultCommands)
    for (let index = 0; index < dbKeys.length; index++) {
        if (checkTrigger(message, client.defaultCommands[dbKeys[index]])) permissionCheck(client, client.defaultCommands[dbKeys[index]], permission)
    }
}

function customCommandsOutput(client, message, permission) {
    const dbKeys = Object.keys(client.customCommands)
    for (let index = 0; index < dbKeys.length; index++) {
        if (checkTrigger(message, client.customCommands[dbKeys[index]])) permissionCheck(client, client.customCommands[dbKeys[index]], permission)
    }
}

function readTags(msg) {
    const userTags = Object.fromEntries(msg.tags)
    const obj = {}
    if (userTags.badges === "") {
        Object.assign(obj, { anybody: true })
    }
    for (let i = 0; i < tagArray.length; i++) {
        if (userTags.badges.includes(tagArray[i])) {
            Object.assign(obj, { [tagArray[i]]: true })
        }
    }
    return obj
}

function checkTrigger(message, DB) {
    for (let index = 0; index < DB.trigger.length; index++) {
        if (message === (DB.trigger[index])) {
            if (DB.state === "true" || DB.state === true) {
                return true
            }
        }
    }
}

function permissionCheck(client, DB, permission) {
    for (let index = 0; index < tagArray.length; index++) {
        if (DB.stateTitle[tagArray[index]] === "true" || DB.stateTitle[tagArray[index]] === true) {
            if (permission[tagArray[index]] === "true" || permission[tagArray[index]] === true) {
                client.client.say(client.username, DB.value)
                return
            }
        }
    }
}

function jokeOutput(client, message) {
    const dbKeys = Object.keys(client.jokeState)
    for (let index = 0; index < dbKeys.length; index++) {
        if (checkTrigger(message, client.jokeState[dbKeys[index]])) sendJoke(client, dbKeys[index])
    }
}

function sendJoke(client, DB) {
    const list = { animals, chuckNorris, deineMudda, flachWitze }
    let randInt = getRandomInt(100)
    if (randInt <= 0) randInt = 1
    client.client.say(client.username, list[DB].jokes[randInt])
}

function commandListOutput(client, userID, message, channel) {
    const commandListTrigger = ["!cmd", "!commands", "!befehle"]
    for (let index = 0; index < commandListTrigger.length; index++) {
        if (message == commandListTrigger[index]) {
            client.client.say(channel, `https://scaletta.live/list?broadcaster=${client.username}&id=${userID}`)
        }
    }
}