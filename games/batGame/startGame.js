import { io } from "../../src/server.js";

export async function sendGame(viewer, emoteId, client, key, color) {
    const gameClient = client.games[key]
    const obj = {
        wallColor: gameClient.settings.wallColor,
        pathColor: gameClient.settings.pathColor,
        duaration: gameClient.settings.duration,
        viewerName: viewer,
        emoteUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/3.0`,
        userColor: color
    }

    if (!client.gamePlayer.includes(viewer)) {
        io.to(gameClient.key).emit("spawnBat", obj)
        client.gamePlayer.push(viewer)
    }
}