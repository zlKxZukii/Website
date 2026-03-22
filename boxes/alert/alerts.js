import { ClientManager } from "../../twitch_bot/connectBot.js";
import { io } from "../../src/server.js";
import chalk from "chalk";

class AlertHandler {
    constructor() {
        this.types = ["Follow", "Sub", "Raid"];
    };

    testAlert(userId, type, username) {
        try {
            const BC = ClientManager.getClient(userId);
            const viewer = "Test Zuschauer";
            const streamer = username;

            if (type === "Follow") {
                Object.assign(BC.alertQuery, { [viewer]: { type: type } });
            }
            if (type === "Sub") {
                Object.assign(BC.alertQuery, { [viewer]: { type: type } });
            }
            if (type === "Raid") {
                const amount = 23;
                Object.assign(BC.alertQuery, {
                    [viewer]: {
                        type: type,
                        amount: amount
                    }
                });
            };

            if (BC.alertQuery.alert === false) {
                BC.alertQuery.alert = true;
                this.sendAlert(BC, streamer, type);
            };
        } catch (error) {
            console.log("klappt nicht der test von den Alerts: " + error);
        };
    };

    saveAlert(userId, event, type) {
        try {
            let streamer = ""
            const BC = ClientManager.getClient(userId);
            if (type === "Follow") {
                const viewer = event.userDisplayName;
                streamer = event.broadcasterDisplayName;
                Object.assign(BC.alertQuery, { [viewer]: { type: type } });
            }
            if (type === "Sub") {
                const viewer = event.userDisplayName;
                streamer = event.broadcasterDisplayName;
                Object.assign(BC.alertQuery, { [viewer]: { type: type } });
            }
            if (type === "Raid") {
                const viewer = event.raidingBroadcasterDisplayName;
                const amount = event.viewers;
                streamer = event.raidedBroadcasterDisplayName;
                Object.assign(BC.alertQuery, {
                    [viewer]: {
                        type: type,
                        amount: amount
                    }
                });
            };

            if (BC.alertQuery.alert === false) {
                BC.alertQuery.alert = true;
                this.sendAlert(BC, streamer, type);
            };
        } catch (error) {
            console.log(chalk.red("Fehler im speichern: " + error));
        };
    };

    async sendAlert(BC, streamer, type) {
        let keys = Object.keys(BC.alertQuery);
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        try {
            while (Object.keys(BC.alertQuery).length !== 1) {

                // kommt direkt aus der DB
                const obj = {
                    color: BC.alertBox[type].color,
                    volume: BC.alertBox[type].volume,
                    img: BC.alertBox[type].img,
                    sound: BC.alertBox[type].sound
                };

                let text = BC.alertBox[type].text.replaceAll("[viewer]", keys[1])
                    .replaceAll("[streamer]", streamer)
                    .replaceAll("[amount]", BC.alertQuery[keys[1]].amount);
                Object.assign(obj, { text: text });

                io.to(BC.wsKeys.alertBoxKey).emit("new-alert", obj);
                await delay(12000);
                delete BC.alertQuery[keys[1]];
                keys = Object.keys(BC.alertQuery);
            };
        } catch (error) {
            console.log(chalk.red("Fehler im speichern: " + error));
        }
        finally {
            BC.alertQuery.alert = false;
        };
    };
};

export const Alerts = new AlertHandler();