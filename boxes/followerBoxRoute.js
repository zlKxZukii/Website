import { spawn } from "child_process";
import express from "express"
import client from "../src/redisClient.js";
import crypto from "crypto";
import fs from "fs";

import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import { upload } from "../multer/upload.js";
import path from "path";
import { Alerts } from "./alert/alerts.js";

export let FollowBoxRoute = express.Router()

FollowBoxRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = await ClientManager.getClient(sessionData.userId)
        const AlertBox = await Select.AlertBox([sessionData.userId]);
        const alertKey = await Select.AlertBoxKey([sessionData.userId])
        const obj = {
            link: `https://scaletta.live/alertbox/${alertKey.key}`,
            css: "../../css/boxes/box.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            boxes: "Follower",
            title: "Follower Box",
            showBody: true,
            helpLink: `https://scaletta.live/alertbox`,
            change: `https://scaletta.live/follows/${alertKey.key}/renew`,
            key: alertKey.key,
        };
        if (!user) {
            for (const element of AlertBox) {
                if (element.type === "Follower") {
                    Object.assign(obj, {
                        [obj.boxes]: {
                            color: element.settings.color,
                            state: element.settings.state,
                            selectedLayout: element.settings.layout,
                            viewer: element.settings.viewer,
                            volume: element.settings.volume,
                            duration: element.settings.duration,
                            streamer: element.settings.streamer,
                            text: element.settings.responseText,
                            family: element.settings.family,
                            size: element.settings.size,
                            decoration: element.settings.decoration,
                            weight: element.settings.weight
                        }
                    })
                };
            };
        }
        else {
            const element = user.alertBox.Follower
            Object.assign(obj, {
                [obj.boxes]: {
                    color: element.settings.color,
                    state: element.settings.state,
                    selectedLayout: element.settings.layout,
                    viewer: element.settings.viewer,
                    volume: element.settings.volume,
                    duration: element.settings.duration,
                    streamer: element.settings.streamer,
                    text: element.settings.responseText,
                    family: element.settings.family,
                    size: element.settings.size,
                    decoration: element.settings.decoration,
                    weight: element.settings.weight
                }
            })
        }
        res.render("main/boxes/followBox.ejs", obj);
    } catch (error) {
        console.log(error);
        res.redirect("/follows");
    };
})

FollowBoxRoute.get("/:key/renew", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = await ClientManager.getClient(sessionData.userId)
        const newAlertKey = crypto.randomBytes(64).toString("hex");

        user.wsKeys.alertBoxKey = newAlertKey
        await Insert.AlertBoxKey([sessionData.userId, newAlertKey])

    } catch (error) {
        console.log("Neuer Key kann nicht generiert werden " + error)
    }
    res.redirect("/follows")
})

FollowBoxRoute.post('/save', async (req, res) => {
    // const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);

        const { state, volume, duration, responseText, color, selectedLayout, viewer, streamer, family, size, decoration, weight } = req.body;
        if (user) {
            const alertBox = user.alertBox.Follower.settings;
            alertBox.state = state
            alertBox.volume = volume
            alertBox.duration = duration
            alertBox.responseText = responseText
            alertBox.color = color
            alertBox.layout = selectedLayout
            alertBox.viewer = viewer
            alertBox.streamer = streamer
            alertBox.family = family
            alertBox.size = size
            alertBox.decoration = decoration
            alertBox.weight = weight
        }
        await Insert.UpdateAlertBoxSettings([sessionData.userId, "Follower", JSON.stringify({ state, volume, duration, responseText, color, layout: selectedLayout, viewer, streamer, family, size, decoration, weight })]);
    } catch (error) {
        console.log("Fehler beim Speichern des Followers: " + error)
    }
    res.redirect('/follows');
});

FollowBoxRoute.post('/upload/follow',
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'sound', maxCount: 1 }
    ]),
    async (req, res) => {
        const key = req.signedCookies.access_validator;
        if (!key) return res.redirect("/index=true");

        try {
            const sessionDataRaw = await client.get(`sess:${key}`);
            if (!sessionDataRaw) return res.status(401).send("Session abgelaufen.");
            const sessionData = JSON.parse(sessionDataRaw);
            const userId = sessionData.userId;
            const user = ClientManager.getClient(userId);
            const userFolder = path.join("uploads", "follow", String(userId));

            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }

            // HILFSFUNKTION: Verarbeitet FFmpeg als Promise
            const processFile = (args, inputPath) => {
                return new Promise((resolve, reject) => {
                    const ffmpeg = spawn('ffmpeg', args);
                    ffmpeg.on('close', (code) => {
                        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                        code === 0 ? resolve() : reject(new Error(`FFmpeg Code ${code}`));
                    });
                    ffmpeg.on('error', (err) => {
                        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                        reject(err);
                    });
                });
            };

            // 1. BILD VERARBEITUNG
            if (req.files && req.files['image']) {
                const file = req.files['image'][0];
                const imageName = `image-${Date.now()}.webp`;
                const imagePath = path.join(userFolder, imageName);

                await processFile([
                    '-t', '10',
                    '-i', file.path,
                    '-vf', 'fps=30,scale=256:256:force_original_aspect_ratio=increase,crop=256:256,format=yuva420p',
                    '-vcodec', 'libwebp',
                    '-lossless', '0',
                    '-q:v', '75',
                    '-compression_level', '6',
                    '-preset', 'picture',
                    '-loop', '0',
                    '-an',
                    '-y',
                    imagePath
                ], file.path);

                // Alte Bilder löschen
                const files = await fs.promises.readdir(userFolder);
                for (const f of files) {
                    if (f.startsWith('image-') && f !== imageName) {
                        await fs.promises.unlink(path.join(userFolder, f)).catch(() => { });
                    }
                }
                const imagePathEnd = `../../${imagePath}`;
                if (user) {
                    user.alertBox.Follower.img = imagePathEnd;
                }
                await Insert.UpdateAlertBoxImage([userId, "Follower", imagePathEnd]);
            }

            // 2. SOUND VERARBEITUNG
            if (req.files && req.files['sound']) {
                const file = req.files['sound'][0];
                const soundName = `sound-${Date.now()}.mp3`;
                const soundPath = path.join(userFolder, soundName);

                await processFile([
                    '-i', file.path, '-acodec', 'libmp3lame', '-y', soundPath
                ], file.path);

                // Alte Sounds löschen
                const files = await fs.promises.readdir(userFolder);
                for (const f of files) {
                    if (f.startsWith('sound-') && f !== soundName) {
                        await fs.promises.unlink(path.join(userFolder, f)).catch(() => { });
                    }
                }
                const soundPathEnd = `../../${soundPath}`;
                if (user) {
                    user.alertBox.Follower.sound = soundPathEnd;
                }
                await Insert.UpdateAlertBoxSound([userId, "Follower", soundPathEnd]);
            }
            res.redirect("/follows");
        } catch (error) {
            console.error("Upload Error:", error);
            // Temp-Dateien aufräumen im Fehlerfall
            if (req.files) {
                Object.values(req.files).flat().forEach(f => {
                    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                });
            }
            if (!res.headersSent) res.status(500).send("Serverfehler.");
        }
    }
);

FollowBoxRoute.post('/test', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    Alerts.testAlert(sessionData.userId, "Follower", sessionData.username)
    res.redirect('/follows')
})