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
            const { chatClient, wsKeys, apiClient, browserKeys } = await this.createBot(username, userId);
            const clipBoxColors = await this.boxSettings(userId)
            const games = await this.games(userId)
            const alertBox = await this.getAlertBox(userId)
            const alertQuery = {}
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
                alertBox,
                alertIsActive: false,
                browserKeys,
                clipRun: true,
                clipBoxColors,
                isShoutout: true,
                gameRuns: false,
                gamePlayer: [],
                games
            });
            console.log(username)
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
        const browserKeys = await this.browserTools(userId)
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
            apiClient: apiClient,
            browserKeys: browserKeys
        }
    }

    getClient(userID) {
        return this.client.get(userID);
    }

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
        let alertKey = await Select.AlertBoxKey([userId])
        if (!alertKey) {
            alertKey = await this.CreateAlertBox(userId)
        }
        Object.assign(obj, { alertBoxKey: alertKey.key })
        return obj
    }

    async getAlertBox(userId) {
        const DB = await Select.AlertBox([userId])
        const obj = {}
        for (const element of DB) {
            Object.assign(obj, this.saveAlertBoxInClient(element.type, element.settings, element.image_path, element.sound_path))
        }
        return obj
    }

    saveAlertBoxInClient(type, settings, img, sound) {
        return {
            [type]: {
                settings,
                img,
                sound
            }
        };
    };

    async CreateAlertBox(userId) {
        const alertKeyNew = crypto.randomBytes(64).toString("hex");

        class UserSettings {
            constructor(color = '#ffffff', rainbow = false, animation = 'off') {
                this.color = color;
                this.rainbow = rainbow;
                this.animation = animation;
            };
        };

        const viewer = new UserSettings();
        const streamer = new UserSettings();
        const amount = new UserSettings();
        const tier = new UserSettings();
        const bundle = new UserSettings();
        const cumulativ = new UserSettings();
        const streak = new UserSettings();
        const post = new UserSettings();

        const createAlertBoxArr = [
            { type: 'Follower', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] folgt jetzt auch [streamer]!', color: '#ffffff', layout: 'top', viewer, streamer, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
            { type: 'Raids', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] raidet [streamer] mit [amount] Zuschauern!', color: '#ffffff', layout: 'top', viewer, streamer, amount, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
            { type: 'Bits', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] wirft [amount] Bits in den Chat von [streamer]!', color: '#ffffff', layout: 'top', viewer, streamer, amount, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
            { type: 'Subscriber', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] Subt auf Stufe [tier] bei [streamer]!', color: '#ffffff', layout: 'top', viewer, streamer, tier, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
            { type: 'Subscriber Geschenke', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] haut im Chat von [streamer], [amount] Subs raus mit Stufe [tier]. Insgesamt hat [viewer] schon [cumulativ] Subs gedropt!', color: '#ffffff', layout: 'top', viewer, streamer, amount, tier, cumulativ, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
            { type: 'Fortlaufende Subscriber', imagePath: '../../uploads/default/owl.gif', soundPath: '../../uploads/default/sound.mp3', settings: { state: true, volume: 20, duration: '12', responseText: '[viewer] Resubt auf Stufe [tier] bei [streamer] und ist seit [streak] Monaten dabei damit hat [viewer] insgesamt [cumulativ] Monate gesubt! Das sagt er dazu: [post]', color: '#ffffff', layout: 'top', viewer, streamer, bundle, tier, streak, cumulativ, post, family: "'Inter', sans-serif", size: 20, decoration: 'normal', weight: 100 } },
        ];

        for (const element in createAlertBoxArr) {
            await Insert.CreateAlertBox([userId, createAlertBoxArr[element].type, createAlertBoxArr[element].settings, createAlertBoxArr[element].imagePath, createAlertBoxArr[element].soundPath])
        }

        const key = await Insert.AlertBoxKey([userId, alertKeyNew]);
        return key.rows[0].key
    }

    async initTimer(client, username, userId) {
        const tasks = {}
        const DB = await Select.Intervall([userId]);
        for (const entry of DB) {
            if (entry.state) {
                Object.assign(tasks,{[entry.category]: setInterval(() => {
                    client.say(username, entry.response_text)
                }, entry.intervall * 1000)})
            };
        };
        return tasks
    };

    async browserTools(userId) {
        const retObj = {}
        const DB = await Select.GetBrowserToolsKey([userId])
        if (!DB || DB.length <= 0) {
            const creationArr = [{ type: 'ClipBox' }];
            for (const tool of creationArr) {
                const key = crypto.randomBytes(64).toString("hex");
                Object.assign(retObj, { [tool.type]: key })
                await Insert.CreateBrowserTool([userId, tool.type, key])
            }
        }
        else {
            for (const tool in DB) {
                Object.assign(retObj, { [DB[tool].type]: DB[tool].key })
            }
        }
        return retObj
    }

    async games(userId) {
        const gameObj = [
            {
                game: 'Bat',
                trigger: ['!bat', '!bats'],
            }
        ];
        const settings = {
            wallColor: '#fff',
            pathColor: '#333'
        }
        const retObj = {}
        const DB = await Select.GetGames([userId])
        if (!DB) {
            const key = crypto.randomBytes(64).toString("hex");
            for (const gameName of gameObj) {
                console.log(await Insert.CreateGame([
                    userId,
                    gameName.game,
                    gameName.trigger,
                    key,
                    settings,
                    {}]));
                Object.assign(retObj, {
                    [gameName]: {
                        game: gameName.game,
                        triggers: gameName.trigger,
                        key: key,
                        settings,
                        leaderboard: {},
                        state: false
                    }
                })
            }
        }
        else if (DB.length < gameObj.length) {
            let key = DB[0]
            if (key === undefined) {
                key = crypto.randomBytes(64).toString("hex");
            }
            else {
                key === DB[0].key
            }
            for (const gameName of gameObj) {
                await Insert.CreateGame([
                    userId,
                    gameName.game,
                    gameName.trigger,
                    key,
                    settings,
                    {}])
                Object.assign(retObj, {
                    [gameName.game]: {
                        game: gameName.game,
                        triggers: gameName.trigger,
                        key: key,
                        settings,
                        leaderboard: {},
                        state: false
                    }
                })
            }

        }
        else {
            for (const entries of DB) {
                Object.assign(retObj, {
                    [entries.game]: {
                        game: entries.game,
                        key: entries.key,
                        settings: entries.settings,
                        leaderboard: entries.leaderboard,
                        triggers: entries.triggers,
                        state: entries.state
                    }
                })
            }
        }
        return retObj
    }

    async boxSettings(userId) {
        const DB = await Select.GetBrowserToolsKey([userId])
        for (const tool of DB) {
            if (tool.type === "ClipBox") {
                return tool.settings
            }
        }
    }
}

export const ClientManager = new BotManager()