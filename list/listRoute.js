import express from "express"
import { ClientManager } from "../twitch_bot/connectBot.js"
import client from "../src/redisClient.js"
export let listRoute = express.Router()

const listArr = ['defaultCommands', 'customCommands', 'jokeState', 'games']

listRoute.get(("/:userid"), async (req, res) => {
    const { userid } = req.params
    const user = ClientManager.getClient(userid)
    if (!user) {
        res.redirect("/")
    }
    const realUser = await user.apiClient.users.getUserById(user.userId)
    const obj = {
        title: `Befehle von ${realUser.displayName}`,
        css: "../css/list/list.css",
        showBody: true,
        streamer: realUser.displayName,
        streamerPb: realUser.profilePictureUrl,
        description: realUser.description,
        list: "",
        username: null,
        img: null,
        list: null
    }
    const data = await getListData(user)
    obj.list = data

    const key = req.signedCookies.access_validator;
    if (key) {
        try {
            const rawData = await client.get(`sess:${key}`);
            if (rawData) {
                const sessionData = JSON.parse(rawData);
                obj.username = sessionData.username;
                obj.img = sessionData.profilePicture;
            }
        } catch (err) {
            console.log("Redis Fehler ignoriert");
        }
    };
    res.render("main/list/list.ejs", obj)
})

async function getListData(user) {
    const obj = {}
    for (const key of listArr) {
        for (const index of Object.keys(user[key])) {
            const sender = user[key][index]
            if (sender.state) {
                Object.assign(obj, {
                    [sender.category || sender.game]: {
                        title: sender.category || sender.game,
                        triggers: sender.triggers
                    }
                })
            }
        }
    }
    if (user.spotify.state !== 'not connected') {
        Object.assign(obj, {
            SpotifySkip:
            {
                title: 'Spotify Nächstes Lied',
                triggers: '!skipsong'
            },
            SpotifyVol:
            {
                title: 'Spotify Lautstärke verändern',
                triggers: '!volume'
            },
            SpotifyAdd:
            {
                title: 'Spotify Lied der Warteschlange hinzufügen',
                triggers: '!addsong'
            },
            SpotifyNow:
            {
                title: 'Spotify Der Name des momentanen Liedes wird ausgegeben. ',
                triggers: '!nowplaying'
            }, 
            SpotifyNext:
            {
                title: 'Spotify Der Name des nächsten Liedes wird ausgegeben.',
                triggers: '!nextsong'
            },
        })
    }
    return obj
}