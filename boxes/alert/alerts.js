import { ClientManager } from "../../twitch_bot/connectBot.js"
import { io } from "../../src/server.js"
import chalk from "chalk";

class AlertHandler {

    saveAlert(userId, event, type) {
        try {
            const BC = ClientManager.getClient(userId);
            const viewer = event.userDisplayName
            const streamer = event.broadcasterDisplayName

            Object.assign(BC.alertQuery, {[viewer]:type})
            if (BC.alertQuery.alert === false) {
                this.sendAlert(userId, viewer, streamer, type)
            }
        } catch (error) {
            console.log(chalk.red("Fehler im speichern: " + error))
        }
    }

    async sendAlert(userId, viewer, streamer, type) {
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        const BC = ClientManager.getClient(userId);
        console.log(BC.alertQuery)
        try {
            while (Object.keys(BC.alertQuery).length !== 1) {
                let text = BC.alertBox.Follow.text.replaceAll("[viewer]", viewer).replaceAll("[streamer]", streamer)

                io.to(BC.wsKeys.alertBoxKey).emit("new-alert", {
                    color: BC.alertBox[type].color,
                    volume: BC.alertBox[type].volume,
                    img: BC.alertBox[type].img,
                    sound: BC.alertBox[type].sound,
                    text: text
                });
                delete BC.alertQuery[viewer]

                await delay(12000)

            };

        } catch (error) {
            console.log(chalk.red("Fehler im speichern: " + error))
        }
        finally{
            BC.alertQuery.alert = false;
        }

    }
}

export const Alerts = new AlertHandler()