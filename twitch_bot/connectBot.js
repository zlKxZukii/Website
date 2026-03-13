import dotenv from "dotenv";
dotenv.config({
    path: './src/.env',
    quiet: true
});
import { ChatClient } from '@twurple/chat';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { createApiClient } from "./createAPIclient.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { answers } from "./controller.js";
import chalk from "chalk";
import crypto from "crypto";
import { eventSubListener, io } from "../src/server.js";
import { subscribeUser } from "./eventListener.js";

class BotManager {
    constructor() {
        this.client = new Map();
    };

    async start(username, userId) {

        if (this.client.has(userId)) return;

        try {
            const { chatClient, wsKeys, apiClient } = await this.createBot(username, userId);

            const alertBox = await this.getAlertBox(userId)
            const alertQuery = {alert:false}
            const jokeState = await Select.JokeDataForUser([userId]) || {};
            const defaultCommands = await Select.Commands([userId]) || {};
            const accessShieldState = await Select.AccessShield([userId]) || {};
            const customCommands = await Select.CustomCommand([userId]) || {};
            const spamBotProtection = {};
            const intervallList = await this.initTimer(chatClient, username, userId);
            this.client.set(userId, {
                userId,
                chatClient,
                username,
                wsKeys,
                apiClient,
                jokeState,
                defaultCommands,
                accessShieldState,
                customCommands,
                spamBotProtection,
                intervallList,
                alertQuery,
                alertBox
            });

            await Insert.BotState([userId, true, username]);

            // zeigt die komplette User Lise
            // console.log(this.getClient(userId))

            try {
                await subscribeUser(eventSubListener, userId, io, this.client);
                await chatClient.connect();
            } catch (error) {
                console.log(chalk.red("der bot konnte nicht gestartet werden " + error.message))
            }

        } catch (error) {
            console.log("Error Bot Start ", error)
        }
    }

    async createBot(username, userId) {
        // wenn kein key  existiert wird einer neuer erstellt  
        const wsKeys = await this.getWsKeys(userId)
        const tokenData = await Select.Token([userId])
        const authProviderComp = await getAuthProvider(tokenData)
        const apiClient = await createApiClient(authProviderComp)

        const chatClient = new ChatClient({
            authProvider: authProviderComp,
            authUserId: userId,
            channels: [username],
            requestMembershipEvents: true,
            connectionOptions: {
                connectionRetries: 15
            }
        });

        chatClient.onConnect(async () => {

        });

        chatClient.onMessage(async (channel, user, message, msg) => {
            await answers(channel, user, message, msg, userId)
        })

        chatClient.onDisconnect(((manually, reason) => {
            if (manually) {
                console.log("der bot wurde erfolgreich per hand getrennt")
            }
            else {
                console.log(chalk.red("der bot ist abgeschmiert" + reason))
            }
        }))

        return {
            chatClient: chatClient,
            wsKeys: wsKeys,
            apiClient: apiClient
        }
    }

    async initTimer(client, username, userId) {
        const intervallList = {};
        const DB = await Select.Intervall([userId]);
        for (let index = 0; index < DB.length; index++) {
            if (DB[index].state) {
                Object.assign(intervallList, {
                    [DB[index].category]: setInterval(() => {
                        client.say(username, DB[index].response_text)
                    }, Number(DB[index].intervall) * 1000)
                });
            };
        };
        return intervallList
    };

    async disconnect(userID) {
        const data = this.client.get(userID);
        const { chatClient, username, wsListener, intervallList } = data
        if (!chatClient) return;
        if (wsListener) {
            wsListener.stop();
        }
        Object.values(intervallList).forEach(clearInterval)
        await Insert.BotState([userID, false, username]);

        chatClient.quit();
        this.client.delete(userID);

    }

    async restartBot(username, userID, loginKey) {
        const botState = await Select.Users(['bot_state'], [loginKey])
        if (botState.bot_state) {
            await this.disconnect(userID)
            await this.start(username, userID)
        }
    }

    async getWsKeys(userId) {
        const obj = { obsDocksKeys: {} }
        // OBS docks
        const obsKeysArray = ["ads"]
        let obsDockKeys = await Select.obsDocks([userId])

        if (!obsDockKeys || obsDockKeys.length < obsKeysArray.length) {
            for (let index = 0; index < obsKeysArray.length; index++) {
                const newKey = crypto.randomBytes(64).toString("hex");
                await Insert.obsDocks([userId, obsKeysArray[index], newKey,])
            }
            obsDockKeys = await Select.obsDocks([userId])
        }

        for (const element of obsDockKeys) {
            if (obsKeysArray.includes(element.category)) {
                Object.assign(obj.obsDocksKeys, { [element.category]: element.keys })
            }
        }

        // alertBox
        let alertKey = await Select.AlertBox([userId])
        if (!alertKey[0]) {
            alertKey = await this.CreateAlertBox(userId)
        }
        Object.assign(obj, { alertBoxKey: alertKey[0].alert_key })
        return obj
    }

    async getAlertBox(userId) {
        const DB = await Select.AlertBox([userId])
        const obj = {

        }
        for (const element of DB) {
            Object.assign(obj, {
                [element.type]: {
                    color: element.settings.color,
                    volume: element.settings.volume,
                    img: element.settings.imagePath,
                    sound: element.settings.soundPath,
                    text: element.settings.response_text
                }
            })
        }
        return obj
    }

    getClient(userID) {
        return this.client.get(userID);
    }

    async CreateAlertBox(userId) {
        const alertKeyNew = crypto.randomBytes(64).toString("hex");
        const createAlertBoxArr = [
            { type: 'Follow', settings: { volume: 20, color: '#ffffff', response_text: '', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3' } },
            { type: 'Sub', settings: { volume: 20, color: '#ffffff', response_text: '', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3' } },
            { type: 'Raid', settings: { volume: 20, color: '#ffffff', response_text: '', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3' } }
        ];
        for (const element in createAlertBoxArr) {
            await Insert.AlertBoxKey([userId, alertKeyNew, createAlertBoxArr[element].type, createAlertBoxArr[element].settings])
        }
        const alertKey = await Select.AlertBox([userId])
        return alertKey
    }
}

export const ClientManager = new BotManager()