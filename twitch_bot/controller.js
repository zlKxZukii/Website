import { ClientManager } from "./connectBot.js";
import { messageProtection } from "./functions/spamProtection.js";
import { clip } from "./functions/createClip.js";
import { getRandomInt } from "../randomizer/randomNumber.js";
import { Insert, Select } from "../sql/sqlHandler.js";
import { ActionManager } from "../ToolManager/Manager.js";
import { Alerts } from "../boxes/alert/alerts.js";
import { parseChatMessage } from "@twurple/chat";
import { sendGame } from "../games/batGame/startGame.js";
import { StreamNotLiveError } from "@twurple/api";
import { apiClient, spotifyApi } from "../src/server.js";
import { response } from "express";
import axios from "axios";
// import { io } from "../src/server.js";

const tagArray = ["broadcaster", "subscriber", "vip", "moderator", "anybody"];

export async function answers(channel, user, m, msg, userID) {
    const message = m.toLowerCase()
    const client = ClientManager.getClient(userID)
    const permission = readTags(msg)
    await chatFunctions(client, msg.userInfo, client.apiClient, message,)
    customCommandsOutput(client, message, permission, msg)
    await jokeOutput(client, message)
    await games(client, message, msg)
    await lastFmReader(message, client, userID)
    await spotifyReader(message, client)
    await defaultCommandsOutput(client, message, permission, user, msg, client)
    commandListOutput(client, userID, message, channel)
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

        if (message.startsWith("!clip") && client.defaultCommands[index].category === "Clip" && client.defaultCommands[index].state === true) {
            // cooldown init
            let title = null;
            const titleRaw = message.replace("!clip", '')
            if (titleRaw.length >= 3) {
                title = titleRaw
            }
            client.defaultCommands[index].state = false
            await clip(client.username, client.userId, client.apiClient, client.chatClient, client.defaultCommands[index].settings.clipLength, title)
            setTimeout(() => {
                client.defaultCommands[index].state = true
            }, 120000);
        }
        else if (client.defaultCommands[index].category === 'Shoutout') {

            for (const trigger of client.defaultCommands[index].triggers) {
                if (message.toLowerCase().startsWith(trigger) && client.defaultCommands[index].state === true) {
                    let streamer = message.toLowerCase().replace(/^!(so|sh(outout)?)\s*/, "").trim();
                    try {
                        const shObj = {
                            viewerName: streamer,
                            apiClient: client.apiClient,
                            text: client.defaultCommands[index].response_text
                        }
                        if (streamer.length === 0 && !client.lastRaider) {
                            return client.chatClient.say(client.username, "Kein Raider in der Warteschlange gefunden.")
                        }
                        else if (client.lastRaider.length >= 3) {
                            shObj.viewerName = client.lastRaider
                        }
                        const response = await ActionManager.shoutOut(shObj)
                        Object.assign(response, {
                            color: client.defaultCommands[index].settings.color,
                            sound: client.defaultCommands[index].settings.sound
                        })
                        return Alerts.saveShoutout(client, response)
                    } catch (error) {
                        console.log("Keinen User gefunden: ", streamer, " ", error.message)
                        client.chatClient.say(client.username, `@${user} Ist der Name richtig geschrieben?`)
                    }
                }
            }
        }
        else if (checkTrigger(message, client.defaultCommands[index])) permissionCheck(client, client.defaultCommands[index], permission, user)
    }
}

function customCommandsOutput(client, message, permission, user) {
    const dbKeys = Object.keys(client.customCommands)
    for (let index = 0; index < dbKeys.length; index++) {
        if (checkTrigger(message, client.customCommands[dbKeys[index]])) permissionCheck(client, client.customCommands[dbKeys[index]], permission, user)
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
        console.log(DB)
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
    const commandListTrigger = ["!cmd", "!cmds", "!commands", "!command", "!befehle", "!befehl"]
    for (const trigger of commandListTrigger) {
        if (message === trigger) {
            client.chatClient.say(channel, `https://scaletta.live/list/${userID}`)
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

async function spotifyReader(m, client) {
    if (client.spotify.state === 'not connected') {
        return
    }
    if (client.spotify.state) {
        const message = m.toLowerCase()
        const userId = client.userId;

        let { spotify_access_token, spotify_refresh_token } = await Select.GetSpotifyUser([userId])
        let data = await Spotify.readSong(spotify_access_token)

        if (data.error?.status === 401) {
            await spotifyApi.setRefreshToken(spotify_refresh_token);
            const refreshData = await spotifyApi.refreshAccessToken();
            spotify_access_token = refreshData.body.access_token;
            await Insert.UpdateSpotifyUser([userId, spotify_access_token])
            data = await Spotify.readSong(spotify_access_token)
        }

        try {
            await spotifyApi.setAccessToken(spotify_access_token);
            await spotifyApi.setRefreshToken(spotify_refresh_token);
        } catch (error) {
            console.log("Fehler beim setzen der Tokens im controller.")
        }
        if (message === "!nextsong") {
            return client.chatClient.say(client.username, `Als nächstes läuft: ${data.queue[0].name} von ${data.queue[0].artists[0].name}`)
        }
        else if (message === "!nowplaying") {
            console.log(data.currently_playing.name)
            return client.chatClient.say(client.username, `Jetzt gerade läuft: ${data.currently_playing.name} von ${data.currently_playing.artists.map(a => a.name).join(', ')}`)
        }
        else if (message.startsWith('!addsong')) {
            if (data.currently_playing === null) {
                return client.chatClient.say(client.username, "Es läuft momentan keine Musik!")
            }
            const prod = message.replace('!addsong', "")
            const result = await Spotify.addSongToQueue(prod, spotify_access_token, spotify_refresh_token)
        }
        else if (message.startsWith('!skipsong')) {
            if (data.currently_playing === null) {
                return client.chatClient.say(client.username, "Es läuft momentan keine Musik!")
            } await Spotify.skipSong(spotify_access_token, spotify_refresh_token)
        }
        else if (message.startsWith('!volume')) {
            if (data.currently_playing === null) {
                return client.chatClient.say(client.username, "Es läuft momentan keine Musik!")
            }
            const prod = message.replace('!volume', "").trim()
            await Spotify.songVolume(prod, spotify_access_token, spotify_refresh_token)
        }
        // !skipsong , !nextsong , !nowplaying , !addsong , !volume
    }
}

class SpotifyChecker {
    async readSong(at) {
        try {
            return this.getOwnQueue(at)
        } catch (error) {
            console.log(error)
        }
    }

    async getOwnQueue(at) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${at}`
                }
            });
            if (response.status === 204) {
                return { error: 'Gerade läuft nichts!' }
            }
            if (response.status === 401) {
                return { error: { status: 401 } }
            }
            const data = await response.json();
            return data

        } catch (error) {
            console.log(error)
        }
    }

    async addSongToQueue(message) {
        try {
            const searchSong = await spotifyApi.searchTracks(message)
            const song = await spotifyApi.getTrack(searchSong.body.tracks.items[0].id)
            spotifyApi.addToQueue(song.body.uri)
            return { message: "" }
        } catch (error) {
            return { message: 'nicht gefunden' }
        }
    }

    async songVolume(message) {
        await spotifyApi.setVolume(message)
    }

    async skipSong() {
        await spotifyApi.skipToNext()
    }
}

const Spotify = new SpotifyChecker()

async function lastFmReader(message, client, userId) {
    if (client.lastFM.state === 'not connected') {
        return
    }
    const DB = await Select.LastFmUserById([userId])
    const apiKey = process.env.LASTFM_API_KEY;
    const username = client.username
    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
        params: {
            method: 'user.getRecentTracks',
            user: DB.username,
            api_key: apiKey,
            format: 'json',
            limit: 1
        }
    });
    const data = response.data.recenttracks.track[0];
    const songInfo = {
        artist: data.artist['#text'],
        track: data.name,
        nowPlaying: null,
    };

    if (data['@attr']) {
        songInfo.nowPlaying = data['@attr'].nowplaying
    };
    if (message === '!nowplaying') {
        if (songInfo.nowPlaying === 'true') {
            client.chatClient.say(username, `Gerade läuft '${songInfo.track}' von '${songInfo.artist}'`)
        }
        else if (songInfo.nowPlaying === null) {
            client.chatClient.say(username, "Momentan ist es still.")
        }
    }
}