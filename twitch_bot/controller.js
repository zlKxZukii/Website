import { ClientManager } from "./connectBot.js";
import { messageProtection } from "./functions/spamProtection.js";
import { clip } from "./functions/createClip.js";
import { getRandomInt } from "../randomizer/randomNumber.js";
import { Select } from "../sql/sqlHandler.js";
import { ActionManager } from "../ToolManager/Manager.js";
import { Alerts } from "../boxes/alert/alerts.js";
import { parseChatMessage } from "@twurple/chat";
import { sendGame } from "../games/batGame/startGame.js";
// import { io } from "../src/server.js";

const tagArray = ["broadcaster", "subscriber", "vip", "moderator", "anybody"];

export async function answers(channel, user, message, msg, userID) {
    const client = ClientManager.getClient(userID)
    const permission = readTags(msg)
    await chatFunctions(client, msg.userInfo, client.apiClient, message,)
    await defaultCommandsOutput(client, message, permission, user, msg, client)
    customCommandsOutput(client, message, permission, msg)
    await jokeOutput(client, message)
    await games(client, message, msg)
    // await shoutOuts(client, msg, channel)
    // funktioniert aber soll erst später eingebunden werden 
    // commandListOutput(client, userID, message, channel)
}

async function chatFunctions(client, user, apiClient, message) {
    for (let index = 0; index < client.accessShieldState.length; index++) {
        if (client.accessShieldState[index].category === "spamBot" && client.accessShieldState[index].state === true) {
            await messageProtection(client, user, apiClient, message)
        }
    }
}

async function defaultCommandsOutput(client, message, permission, user, msg) {
    const dbKeys = Object.keys(client.defaultCommands)
    for (let index = 0; index < dbKeys.length; index++) {

        if (message === "!clip" && client.defaultCommands[[index]].category === "Clip" && client.defaultCommands[[index]].state === true) {
            // cooldown init
            client.defaultCommands[index].state = false
            await clip(client.username, client.userId, client.apiClient, client.chatClient, client.defaultCommands[index].settings.clipLength)
            setTimeout(() => {
                client.defaultCommands[index].state = true
            }, 120000);
        }
        else if (client.defaultCommands[index].category === 'Shoutout') {

            for (const trigger of client.defaultCommands[index].triggers) {
                if (message.toLowerCase().startsWith(trigger) && client.defaultCommands[[index]].state === true) {
                    const streamer = message.toLowerCase().replace(/^!(so|sh(outout)?)\s*/, "").trim();
                    try {
                        const response = await ActionManager.shoutOut(streamer, client.apiClient, client.defaultCommands[index].response_text)
                        Object.assign(response, {
                            color: client.defaultCommands[index].settings.color,
                            sound: client.defaultCommands[index].settings.sound
                        })
                        return Alerts.saveShoutout(client, response)
                    } catch (error) {
                        console.log("Keinen User gefunden: ", streamer, " ", error.message)
                    }
                }
            }
        }
        else if (checkTrigger(message, client.defaultCommands[[index]])) permissionCheck(client, client.defaultCommands[[index]], permission, user)
    }
}

function customCommandsOutput(client, message, permission, user) {
    const dbKeys = Object.keys(client.customCommands)
    for (let index = 0; index < dbKeys.length; index++) {
        if (checkTrigger(message, client.customCommands[[index]])) permissionCheck(client, client.customCommands[[index]], permission, user)
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
    for (let index = 0; index < DB.triggers.length; index++) {
        if (message === (DB.triggers[index])) {
            if (DB.state === true) {
                return true
            }
        }
    }
}

function permissionCheck(client, DB, permission, user) {
    for (let index = 0; index < tagArray.length; index++) {
        if (DB[tagArray[index]] === true) {
            if (permission[tagArray[index]] === true) {

                client.chatClient.say(client.username, DB.response_text.replaceAll("${user}", user))
                return
            }
        }
    }
}

async function jokeOutput(client, message) {
    for (let index = 0; index < client.jokeState.length; index++) {
        if (checkTrigger(message, client.jokeState[index])) await sendJoke(client, client.jokeState[index].category)
    }
}

async function sendJoke(client, DB) {
    const jokes = await Select.AllJokes([DB])

    const randInt = getRandomInt(jokes.length)
    if (randInt <= 0) randInt = 1
    client.chatClient.say(client.username, jokes[randInt].response_text)
}

function commandListOutput(client, userID, message, channel) {
    const commandListTrigger = ["!cmd", "!commands", "!befehle"]
    for (let index = 0; index < commandListTrigger.length; index++) {
        if (message == commandListTrigger[index]) {
            client.chatClient.say(channel, `https://scaletta.live/list?broadcaster=${client.username}&id=${userID}`)
        }
    }
}

async function games(client, message, msg) {
    const keys = Object.keys(client.games)
    const emoteMap = msg.emoteOffsets
    const emoteId = emoteMap.keys().next().value;
    for (const key of keys) {
        for (const trigger of client.games[key].triggers) {
            let parts = message.trim().split(/\s+/);
            if (message === trigger || parts[0] === trigger && parts.length === 2) {
                if (client.games[key].state) {
                    sendGame(msg.userInfo.displayName, emoteId, client, key, msg.userInfo.color)
                }

            }
        }
    }
}

// {
//   'Bat': {
//     game: 'Bat',
//     triggers: [ '!bat', '!bats' ],
//     key: 'c93573f5771d407470594045f75f61907a4c998f4a1223f4dd4012d85abb425cca1ea5e0de5fb5f7f5e92e586ab70e88e21ed3d8440614572777f3e55626fdf7',
//     settings: { wallColor: '#fff', pathColor: '#333' },
//     leaderboard: {}
//   }
// }