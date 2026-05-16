import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express";
export let indexRoute = express.Router();

import { randomJoke } from "../commands/jokeDB/jokeRandomizer.js";
import { randomSocialMedia } from "../randomizer/socialRandomizer.js";
import client from "../src/redisClient.js";
import chalk from "chalk";
import { Select } from "../sql/sqlHandler.js";
import { } from "../src/server.js";

indexRoute.get("", async (req, res) => {

    // await sendToDiscord()

    // const trackInfoParams = new URLSearchParams({
    //     method: 'track.getInfo',
    //     api_key: process.env.LASTFM_API_KEY,
    //     artist: artist, // Der Artist aus dem ersten Request
    //     track: title,    // Der Titel aus dem ersten Request
    //     format: 'json'
    // });

    // const infoResponse = await fetch(`http://ws.audioscrobbler.com/2.0/?${trackInfoParams}`);
    // const infoData = await infoResponse.json();
    // console.log(infoData)

    const trusted = await Select.UsersForStart()
    const trustedKeys = Object.keys(trusted)
    const indexObj = {
        title: "Scaletta | Dein interaktives All-in-One Streaming Tool",
        css: "../css/index.css",
        showBody: true,
        username: null,
        img: null,
        page: 'index',
        trusted: trustedKeys.length
    };
    Object.assign(indexObj, randomSocialMedia(), await randomJoke());

    const key = req.signedCookies.access_validator;
    if (key) {
        try {
            const rawData = await client.get(`sess:${key}`);
            if (rawData) {
                const sessionData = JSON.parse(rawData);
                indexObj.username = sessionData.username;
                indexObj.img = sessionData.profilePicture;
            }

        } catch (err) {
            console.log("Redis Fehler ignoriert");
        }
    };

    // ändern
    if (req.query.index === "true") {
        Object.assign(indexObj, {
            indexText: "Bitte erst anmelden."
        });
    };
    res.render("main/index.ejs", indexObj);
});

indexRoute.get("/logout", async (req, res) => {
    // abfrage ob überhaupt angemeldet
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/");
    };

    // löschen aller cookies und sessions für den perfekten logout
    try {
        const cookieArray = [Object.keys(req.signedCookies), Object.keys(req.cookies)].flat();
        for (const element of cookieArray) {
            res.clearCookie(element);
        };
        await client.del(`sess:${key}`)
    } catch (error) {
        console.log(chalk.red("cookies konnten nicht gelöscht werden " + error.message));
    };

    // rediertect zur startseite
    res.redirect("/");
});

async function sendToDiscord() {
    const content =
    {
        "content": null,
        "embeds": [
            {
                "title": "🦉 Scalettas Regeln! 🦉",
                "color": 2875390,
                "fields": [
                    {
                        "name": "🤝 Respektvolles Miteinander",
                        "value": "Ein höflicher und sachlicher Umgangston ist verpflichtend."
                    },
                    {
                        "name": "🚫 Unterlassung von Spam & Werbung",
                        "value": "Unaufgeforderte Werbung sowie übermäßige Erwähnungen sind untersagt."
                    },
                    {
                        "name": "🤖 Thematische Relevanz",
                        "value": "Beiträge haben sich auf den Twitch-Bot und dessen Funktionen zu beschränken."
                    },
                    {
                        "name": "🔒 Wahrung der Privatsphäre",
                        "value": "Die Weitergabe personenbezogener Daten ist strikt untersagt."
                    },
                    {
                        "name": "⛔ Unzulässige Inhalte",
                        "value": "Illegale, jugendgefährdende oder unangemessene Inhalte sind verboten."
                    },
                    {
                        "name": "🛡️ Weisungsrecht des Serverteams",
                        "value": "Anordnungen von Moderation und Administration ist Folge zu leisten."
                    },
                    {
                        "name": "📌 Sachgemäße Kanalnutzung",
                        "value": "Jeder Kanal ist seinem vorgesehenen Zweck entsprechend zu verwenden."
                    }
                ],
                "footer": {
                    "text": "Scaletta – Das Branding, dem du vertrauen kannst.",
                    "icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/73adc09d-fa34-479c-9010-3d78134773d1-profile_image-300x300.png"
                }
            }
        ],
        "attachments": []
    }

    try {
        const response = await fetch('https://discord.com/api/webhooks/1497841137422045265/RkR2W5uweqN-HrXY5fEA10Yc9tnYFDDojdGyd7G5lN3eE1RftfowOqqHpt1eNkzoUeAQ', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        });

        if (!response.ok) {
            console.error(`Discord Webhook Fehler: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Senden an Discord:", error);
    }
}