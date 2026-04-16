import { promises as fsPromises } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getRandomInt } from "../randomizer/randomNumber.js";


const execFilePromise = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIPS_DIR = path.resolve(__dirname, '../uploads/clips');
if (!fs.existsSync(CLIPS_DIR)) fs.mkdirSync(CLIPS_DIR, { recursive: true });
const SHOUTOUT_DIR = path.resolve(__dirname, '../uploads/shoutout');
if (!fs.existsSync(SHOUTOUT_DIR)) fs.mkdirSync(SHOUTOUT_DIR, { recursive: true });


class Manager {
    async shoutOut(viewerName, apiClient, text) {
        const viewer = await apiClient.users.getUserByName(viewerName)
        const clips = await apiClient.clips.getClipsForBroadcaster(viewer.id, { limit: 1 })
        const game = await this.getGame(apiClient, clips.data[0].gameId)
        const video = await this.getLocalClipUrl(clips.data[0], viewer.id, SHOUTOUT_DIR, 'shoutout')
        console.log(SHOUTOUT_DIR)
        console.log(video)
        let endText = text.replace('[viewer]', viewer.displayName).replace('[game]', game.name)
        console.log(clips.data[0].duration)
        const obj = {
            type: 'Shoutout',
            viewerName: viewer.displayName,
            viewerProfilePicture: viewer.profilePictureUrl,
            video: video,
            responseText: endText,
            gameImg: await game.getBoxArtUrl(170, 240),
            duration: clips.data[0].duration
        }
        return obj
    }

    async initClipForBroadcaster(userId, apiClient, user) {
        if (user.clipRun) {
            user.clipRun = false;

            const { clipId } = await this.getClipsFromBroadcaster(userId, apiClient);

            const game = await this.getGame(apiClient, clipId.gameId)
            const video = await this.getLocalClipUrl(clipId, userId, CLIPS_DIR, 'clips');
            setTimeout(() => {
                user.clipRun = true
            }, clipId.duration * 1000 - 5000);

            return {
                video: video,
                duration: clipId.duration,
                game: game.name,
                cover: await game.getBoxArtUrl(130, 190),
                cliper: clipId.creatorDisplayName
            }
        }
        else {
            return null
        }
    }

    async getClipsFromBroadcaster(userID, apiClient) {
        const clips = await apiClient.clips.getClipsForBroadcaster(userID, { limit: 100 })

        if (clips.data.length != 0) {
            return { clipId: clips.data[getRandomInt(clips.data.length)] }
        }
        else {
            return { clipId: "CloudySarcasticSashimiTwitchRPG" }
        }
    }

    async getGame(apiClient, gameId) {
        return apiClient.games.getGameById(gameId)
    }

    async getLocalClipUrl(clip, userId, dir, type) {


        const userFolder = path.join(dir, userId);
        const finalFileName = `clip.mp4`;
        const tempFileName = `temp_clip.mp4`;

        const finalPath = path.join(userFolder, finalFileName);
        const tempPath = path.join(userFolder, tempFileName);

        // URL für den Browser (Express serviert ab /uploads)

        const publicUrl = `/uploads/${type}/${userId}/${finalFileName}?t=${Date.now()}`;
        try {
            // 1. Sicherstellen, dass der User-Ordner existiert
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
            }
            console.log(`[ClipPlayer] Lade neuen Clip für ${userId} herunter...`);

            // 2. Download in die TEMP-Datei
            // So läuft der alte Clip im Browser weiter, während der neue lädt!
            await execFilePromise('yt-dlp', [
                '--no-part',
                '--force-overwrites',
                '-f', 'best[ext=mp4]',
                '--no-playlist',
                '--quiet',
                '-o', tempPath,
                clip.url
            ]);

            // 3. Wenn fertig: Alten Clip löschen und neuen umbenennen
            if (fs.existsSync(finalPath)) {
                await fsPromises.unlink(finalPath); // Alte Datei löschen
            }
            await fsPromises.rename(tempPath, finalPath); // Temp zu Final machen

            console.log(`[ClipPlayer] Update für ${userId} abgeschlossen.`);
            return publicUrl;
        } catch (err) {
            console.error("Fehler im Download-Prozess:", err);
            // Aufräumen falls Temp-Datei existiert
            if (fs.existsSync(tempPath)) await fsPromises.unlink(tempPath);
            return null;
        }
    }
}

export const ActionManager = new Manager()