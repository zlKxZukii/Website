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

export let SubscriberBoxRoute = express.Router()

SubscriberBoxRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const DB = await Select.AlertBox([sessionData.userId]);
        const obj = {
            link: `https://scaletta.live/alertbox/${DB[0].alert_key}`,
            css: "../../css/boxes/box.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            boxes: "Subscriber Box",
            title: "Subscriber Box",
            showBody: true,
            helpLink: `https://scaletta.live/alertbox`,
            change: `https://scaletta.live/subs/${DB[0].alert_key}/renew`,
            color: "",
            volume: "",
            responseText: "",
            key: DB[0].alert_key
        };

        for (const element of DB) {
            if (element.type === "Sub") {
                obj.color = element.settings.color;
                obj.volume = element.settings.volume;
                obj.responseText = element.settings.response_text;
            };
        };
        res.render("main/boxes/subBox.ejs", obj);
    } catch (error) {
        console.log(error);
        res.redirect("/subs");
    };
})

SubscriberBoxRoute.get("/:key/renew", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const newKey = crypto.randomBytes(64).toString("hex");
        await Insert.AlertBoxKey([sessionData.userId, newKey])
        await ClientManager.restartBot(sessionData.username, sessionData.userId, key)
    } catch (error) {
        console.log("Neuer Key kann nicht generiert werden " + error)
    }
    res.redirect("/subs")
})

SubscriberBoxRoute.post('/save', async (req, res) => {
    // const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };
    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const user = ClientManager.getClient(sessionData.userId);
        const { volume, color, response_text } = req.body
        console.log(user)
        user.alertBox.Sub.color = color
        user.alertBox.Sub.volume = volume
        user.alertBox.Sub.text = response_text

        await Insert.AlertBoxKey([sessionData.userId, user.wsKeys.alertBoxKey, "Sub", JSON.stringify({ color, volume, response_text })]);

    } catch (error) {
        console.log("Fehler beim Speichern des Subscribers: " + error)
    }
    res.redirect('/subs');
});

SubscriberBoxRoute.post('/upload/sub',
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
            const userFolder = path.join("uploads", "sub", String(userId));

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
                user.alertBox.Sub.img = imagePathEnd;
                await Insert.AlertBoxKey([userId, user.wsKeys.alertBoxKey, "Sub", { imagePath: imagePathEnd }]);
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
                user.alertBox.Sub.sound = soundPathEnd;
                await Insert.AlertBoxKey([userId, user.wsKeys.alertBoxKey, "Sub", { soundPath: soundPathEnd }]);
            }
            res.redirect("/subs");
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

SubscriberBoxRoute.post('/test', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    Alerts.testAlert(sessionData.userId, "Sub", sessionData.username)
})