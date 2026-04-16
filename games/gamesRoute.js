import express from "express"
import client from "../src/redisClient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { ClientManager } from "../twitch_bot/connectBot.js";

export let gamesRoute = express.Router()

gamesRoute.get('/', async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/?index=true");
    };

    try {
        const sessionData = JSON.parse(await client.get(`sess:${key}`));
        const DB = await Select.GetGames([sessionData.userId])
        const obj = {
            css: "/css/boxes/help.css",
            username: sessionData.username,
            img: sessionData.profilePicture,
            link: `https://scaletta.live/games/${DB[0].key}`,
            title: "Spiele",
            type: "Spiele",
            showBody: true,
        }
        res.render("main/games/games.ejs", obj)
    } catch (error) {
        console.log(error)
    }
})

gamesRoute.get('/:key', async (req, res) => {
    const obj = {
        css: "/css/games/game-box.css",
        title: "GAME BOX",
        targetUser: req.params.key,
        showBody: false
    }
    res.render("main/games/websocket/gameBox.ejs", obj)
})

gamesRoute.post('/save', async (req, res) => {
    const DB = await Select.GetGamesByKey([req.body.key]);
    
    const gameName = Object.keys(req.body)[0];
    const user = ClientManager.getClient(DB[0].twitch_id)
    for (const entries in DB) {
        if (DB[entries].game === gameName) {
            const newLeaderboard = req.body[gameName];
            const oldLeaderboard = DB[entries].leaderboard || {};

            // 1. Alle Spieler aus beiden Leaderboards sammeln
            const allPlayers = new Set([
                ...Object.keys(oldLeaderboard),
                ...Object.keys(newLeaderboard)
            ]);

            let merged = {};

            // 2. Vergleichen und den besseren Wert behalten
            allPlayers.forEach(player => {
                const oldEntry = oldLeaderboard[player];
                const newEntry = newLeaderboard[player];

                if (oldEntry && newEntry) {
                    // Wer hat die größere Distanz?
                    merged[player] = (newEntry.dist > oldEntry.dist) ? newEntry : oldEntry;
                } else {
                    // Spieler existiert nur in einem der beiden
                    merged[player] = newEntry || oldEntry;
                }
            });

            // 3. Sortieren und auf Top 5 begrenzen
            const finalLeaderboard = Object.fromEntries(
                Object.entries(merged)
                    .sort(([, a], [, b]) => b.dist - a.dist)
                    .slice(0, 5)
            );

            // 4. In die DB schreiben (als JSON-String, falls deine DB Text erwartet)
            const leaderboardString = JSON.stringify(finalLeaderboard);

            await Insert.UpdateLeaderboard([
                DB[entries].twitch_id,
                DB[entries].game,
                req.body.key,
                leaderboardString
            ]);
        }
    }
    user.gamePlayer = []
})