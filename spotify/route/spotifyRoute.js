import express from "express"
import { io, spotifyApi } from "../../src/server.js";
import client from "../../src/redisClient.js";
import { Select, Insert } from "../../sql/sqlHandler.js";
import { ClientManager } from "../../twitch_bot/connectBot.js";
import SpotifyWebApi from 'spotify-web-api-node'; // Wichtig: Import oben in der Datei

export const SpotifyRoute = express.Router()
SpotifyRoute.get("/", async (req, res) => {
    const key = req.signedCookies.access_validator;
    if (!key) {
        return res.redirect("/index=true")
    };
    const sessionData = JSON.parse(await client.get(`sess:${key}`));
    if (sessionData.userId === '487929387' || sessionData.userId === '222491415' || sessionData.userId === '1366495462') {
        const spotifyObj = {
            title: "Spotify Player",
            css: "../css/spotify/page/spotify.css",
            showBody: true,
            showSettings: false,
            type: "Spotify Player",
            username: sessionData.username,
            img: sessionData.profilePicture,
            helpLink: 'https://scaletta.live/browsertools',
            link: null,
            change: ""
        };
        // change setzen!
        const DB = await Select.GetSpotifyKey([sessionData.userId])
        if (DB) {
            const spotifyKey = DB.key
            spotifyObj.showSettings = true
            spotifyObj.link = `https://scaletta.live/spotify/${spotifyKey}`
        }

        res.render("main/spotify/spotify", spotifyObj);
    }
    else {
        return res.redirect("/")
    }
});


SpotifyRoute.post('/song/:key', async (req, res) => {
    const key = req.params.key;
    if (!key) return res.redirect('/index=true');

    try {
        const DB = await Select.SpotifyKey([key]);
        if (!DB) return res.json({ message: 'Ungültiger key' });

        // 1. User-Daten aus der Datenbank holen
        const user = await Select.GetSpotifyUser([DB.twitch_id]);
        if (!user) return res.json({ message: 'Kein Spotify Account verknüpft.' });

        const { spotify_access_token, spotify_refresh_token, spotify_expires_at } = user;

        // 2. LOKALE Instanz erstellen (verhindert Überschneidungen mit anderen Usern)
        const userApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        });

        userApi.setAccessToken(spotify_access_token);
        userApi.setRefreshToken(spotify_refresh_token);

        // 3. Token-Refresh Logik
        // Wir prüfen, ob der Token in weniger als 60 Sek abläuft oder bereits abgelaufen ist
        let currentToken = spotify_access_token;
        if ((spotify_expires_at - Date.now()) < 60000) {
            try {
                const refreshData = await userApi.refreshAccessToken();
                currentToken = refreshData.body.access_token;
                // In der DB aktualisieren (Wichtig: neuen Token und Ablaufzeitpunkt speichern)
                await Insert.UpdateSpotifyUser([DB.twitch_id, currentToken]);

                // Den neuen Token auch in der lokalen Instanz setzen
                userApi.setAccessToken(currentToken);
            } catch (refreshErr) {
                console.error("Refresh fehlgeschlagen:", refreshErr);
                return res.json({ message: 'Auth abgelaufen. Bitte neu einloggen.' });
            }
        }

        // 4. Daten abrufen mit der privaten Instanz
        const data = await userApi.getMyCurrentPlayingTrack();

        if (!data.body || !data.body.item) {
            return res.json({ message: 'Steht still.' });
        }

        const songInfo = {
            song: {
                name: data.body.item.name,
                artist: data.body.item.artists.map(a => a.name).join(', '),
            },
            album: {
                albumCover: data.body.item.album.images[0].url,
                albumName: data.body.item.album.name
            },
            progress: data.body.progress_ms,
            duration: data.body.item.duration_ms,
            isPlaying: data.body.is_playing
        };

        io.to(key).emit('song', songInfo);
        res.json({ message: 'OK' });

    } catch (error) {
        console.error("Fehler in Song-Route:", error);
        res.status(500).json({ message: 'Fehler beim Abrufen des Songs.' });
    }
});

SpotifyRoute.get('/:key', async (req, res) => {
    const spotifyPlayerObj = {
        title: "MUSIC PLAYER",
        css: "/css/spotify/player/style.css",
        showBody: false,
        targetUser: req.params.key
    }
    res.render("main/spotify/player", spotifyPlayerObj);
})