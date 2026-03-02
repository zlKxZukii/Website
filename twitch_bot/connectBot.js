import dotenv from "dotenv";
dotenv.config({
    path: './src/.env',
    quiet: true
});
import { ChatClient } from '@twurple/chat';
import { getAuthProvider } from '../auth/createRefreshToken.js';
import { createApiClient } from "./createAPIclient.js";
import { registerUserEvents } from "../twitch_bot/eventListener.js";
import { Select, Insert } from "../sql/sqlHandler.js";
import { answers } from "./controller.js";
import chalk from "chalk";
import crypto from "crypto";

class BotManager {
    constructor() {
        this.client = new Map();
    };

    async start(username, userId) {

        if (this.client.has(userId)) return;

        try {
            const { client, key, apiClient } = await this.createBot(username, userId);

            const wsListener = await registerUserEvents(userId, key, apiClient);

            const jokeState = await Select.JokeDataForUser([userId]) || {};
            const defaultCommands = await Select.Commands([userId]) || {};
            const accessShieldState = await Select.AccessShield([userId]) || {};
            const customCommands = await Select.CustomCommand([userId]) || {};
            const spamBotProtection = {};
            const intervallList = await this.initTimer(client, username, userId);

            this.client.set(userId, { userId, client, username, wsListener, key, apiClient, jokeState, defaultCommands, accessShieldState, customCommands, spamBotProtection, intervallList });
            // send true to Database

            // zeigt die komplette User Lise
            // console.log(this.getClient(userId))
            
            await Insert.BotState([userId, true, username]);
            try {
                await client.connect();
            } catch (error) {
                console.log(chalk.red("der bot konnte nicht gestartet werden " + error.message))
            }

        } catch (error) {
            console.log("Error Bot Start ", error)
        }
    }

    async createBot(username, userId) {
        // wenn kein alertkey existiert wird einer neuer erstellt
        let alertKey = await Select.AlertBox([userId])
        if (!alertKey) {
            const alertKeyNew = crypto.randomBytes(32).toString("hex");
            await Insert.AlertBoxKey([userId, alertKeyNew])
            alertKey = alertKeyNew
        }

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
            console.log(chalk.blue(username + " connected"))
        });

        chatClient.onConnectionFailed

        chatClient.onMessage(async (channel, user, message, msg) => {
            await answers(channel, user, message, msg, userId)
        })

        chatClient.onDisconnect(((manually, reason) => {
            if (manually) {
                console.log("der bot wurde erfolgreich per hand getrennt")
            }
            else {
                console.log(chalk.red("der bot ist abgeschmiert" + reason.message))
            }
        }))
        return {
            client: chatClient,
            key: alertKey.alert_key,
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
        const { client, username, wsListener, intervallList } = data
        if (!client) return;
        if (wsListener) {
            wsListener.stop();
        }
        Object.values(intervallList).forEach(clearInterval)
        await Insert.BotState([userID, false, username]);

        client.quit();
        this.client.delete(userID);

    }

    getClient(userID) {
        return this.client.get(userID);
    }

    async restartBot(username, userID, loginKey) {
        const botState = await Select.Users(['bot_state'], [loginKey])
        if (botState.bot_state) {
            await this.disconnect(userID)
            await this.start(username, userID)
        }
    }
}

export const ClientManager = new BotManager()