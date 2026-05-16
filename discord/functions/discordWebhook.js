import dotenv from "dotenv";
dotenv.config({ path: './src/.env', quiet: true });

import { ClientManager } from "../../twitch_bot/connectBot.js";
import { Select } from "../../sql/sqlHandler.js";

let live = []

export async function discordWebhookPreperation(event) {
    const scalettasPartner = ['fluffytensu', 'TybaltOE7', 'JayInAShell', 'zlScaletta']
    if (scalettasPartner.includes(event.broadcasterDisplayName)) {
        const broadcaster = await event.getBroadcaster()
        const stream = await event.getStream()
        const response = {
            bot: 'Scalettas Partner Streams',
            streamer: event.broadcasterDisplayName,
            description: broadcaster?.description,
            profilePicture: broadcaster?.profilePictureUrl,
            game: stream?.gameName,
            thumbnail: stream?.thumbnailUrl,
            title: stream?.title,
        }
        if (!live.includes(response.streamer)) {
            live.push(response.streamer)
            sendAlertToDiscord(response)
            setTimeout(() => {
                live = live.filter(
                    name => name.toLowerCase() !== response.streamer.toLowerCase()
                );
            }, 60000);
        }
    }
}

export async function sendAlertToDiscord(response) {
    const { bot, streamer, description, profilePicture, game, thumbnail, title } = response
    const cleanedThumbnail = thumbnail
        .replace('{width}', '1280')
        .replace('{height}', '720');
    const bluePrint = {
        "username": bot,
        "avatar_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/73adc09d-fa34-479c-9010-3d78134773d1-profile_image-300x300.png",
        "content": `🦉 @everyone ${streamer} ist Live!🦉 `,
        "embeds": [
            {
                "title": title,
                "description": description + ", klicke auf den Link, um dabei zu sein!",
                "url": `https://twitch.tv/${streamer}`,
                "color": 2875390,
                "thumbnail": {
                    "url": profilePicture
                }, "fields": [
                    {
                        "name": "Kategorie",
                        "value": game,
                        "inline": true
                    },
                    {
                        "name": streamer,
                        "value": "Gerade gestartet",
                        "inline": true
                    }
                ],
                "image": {
                    "url": cleanedThumbnail
                },
                "footer": {
                    "text": "Gesendet von Scaletta!",
                    "icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/73adc09d-fa34-479c-9010-3d78134773d1-profile_image-300x300.png"
                },
                "timestamp": new Date().toISOString()
            }
        ]
    }
    await fetchData(bluePrint)
}

async function fetchData(bluePrint) {
    try {
        const response = await fetch(process.env.DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bluePrint)
        });

        if (!response.ok) {
            console.error(`Discord Webhook Fehler: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Senden an Discord:", error);
    }
}

export async function userLive(event) {
    try {
        const broadcaster = await event.getBroadcaster()
        const stream = await event.getStream()
        const user = ClientManager.getClient(broadcaster.id)
        const DB = await Select.DiscordWebhooks([broadcaster.id])

        if (user.live) {
            return
        }

        for (const hook of DB) {
            const color = parseInt(hook.color.replace("#", ""), 16)
            const messageIn = hook.message_in.replaceAll('[streamer]', event.broadcasterDisplayName)
            const messageOut = hook.message_out.replaceAll('[streamer]', event.broadcasterDisplayName)
            const response = {
                bot: 'Scaletta',
                streamer: event.broadcasterDisplayName,
                profilePicture: broadcaster?.profilePictureUrl,
                game: stream?.gameName,
                thumbnail: stream?.thumbnailUrl,
                title: stream?.title,
                messageIn,
                messageOut,
                color,
                webhook: hook.webhook
            }

            await workToViewerDiscord(response)
        }
        user.live = true;
    } catch (error) {
        console.log(`Fehler beim Senden an ${event.broadcasterDisplayName}'s Discord`, error)
    }
}

async function workToViewerDiscord(res) {
    const { bot, streamer, profilePicture, game, thumbnail, title, messageIn, messageOut, color, webhook } = res
    const cleanedThumbnail = thumbnail
        .replace('{width}', '1280')
        .replace('{height}', '720');
    const bluePrint = {
        "username": bot,
        "avatar_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/73adc09d-fa34-479c-9010-3d78134773d1-profile_image-300x300.png",
        "content": `${messageOut}`,
        "embeds": [
            {
                "title": title,
                "description": messageIn,
                "url": `https://twitch.tv/${streamer}`,
                "color": color,
                "thumbnail": {
                    "url": profilePicture
                }, "fields": [
                    {
                        "name": "Spiel oder Kategorie",
                        "value": game,
                        "inline": true
                    },
                    {
                        "name": streamer,
                        "value": "Gerade gestartet",
                        "inline": true
                    }
                ],
                "image": {
                    "url": cleanedThumbnail
                },
                "footer": {
                    "text": "Gesendet von scaletta.live",
                    "icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/73adc09d-fa34-479c-9010-3d78134773d1-profile_image-300x300.png"
                },
                "timestamp": new Date().toISOString()
            }
        ]
    }

    await fetchDataToDiscord(bluePrint, webhook)
}

async function fetchDataToDiscord(bluePrint, webhook) {
    try {
        const response = await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bluePrint)
        });

        if (!response.ok) {
            console.error(`Discord Webhook Fehler: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Senden an Discord:", error);
    }
}