import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});
import chalk from "chalk";

import { Select } from "../sql/sqlHandler.js";
import { followProtection } from "./functions/spamProtection.js";
import { getAds } from "../obs_docks/ads/ads.js";
import { apiClient } from "../src/server.js";
import { ClientManager } from "./connectBot.js";
import { Alerts } from "../boxes/alert/alerts.js";

// for schleife hinzufügen für spätere eventuelle erweiterungen der Subscriptions

export async function subscribeUser(eventSubListener, userId, io, client) {
    // try {
    //     const subs = await apiClient.eventSub.getSubscriptionsForUser(userId, 10)
    //     console.log(subs)
    //     await apiClient.eventSub.deleteSubscription(subs.data[0].id)
    // } catch (error) {
    //     console.log(error)
    // }

    try {

        const user = ClientManager.getClient(userId)
        const subs = await apiClient.eventSub.getSubscriptionsForUser(userId, 10)
        // console.log(subs.data)
        const ad = await getAds(userId, client.get(userId).apiClient)

        try {
            await eventSubListener.onStreamOnline(userId, async (event) => {
                console.log(chalk.cyan(`[LIVE] ${event.broadcasterDisplayName}`));
                console.log(ad.ads.nextAdDate)
                io.to(userId).emit("stream-status", { online: true });
            });
        } catch (error) {
            console.log(chalk.red("Fehler beim Online gehen: " + error))
        }
        try {
            await eventSubListener.onChannelAdBreakBegin(userId, async (event) => {
                io.to(user.wsKeys.obsDocksKeys.ads).emit("new-add", {
                    title: "Jetzt läuft Werbung",
                    adNow: event.durationSeconds
                });
                //     setTimeout(async () => {
                //         const ad = await getAds(userId, client.get(userId).apiClient)
                //         console.log(ad.ads.nextAdDate)
                //         // io.to(DB[0].keys).emit("new-add", { 
                //         // title: "Jetzt läuft Werbung",
                //         // adNow: event.durationSeconds });
                //     }, event.durationSeconds + 4000);
            });
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen der Werbung: " + error))
        }

        // Follow Alert
        try {
            eventSubListener.onChannelFollow(userId, userId, async (event) => {
                Alerts.saveAlert(userId, event, "Follower")
            })
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen der Follower: " + error))
        }

        // Raid Alert
        try {
            eventSubListener.onChannelRaidTo(userId, async (event) => {
                Alerts.saveAlert(userId, event, "Raids")
            })
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen des Raids: " + error))
        }

        // Bits Alert
        try {
            eventSubListener.onChannelBitsUse(userId, async (event) => {
                Alerts.saveAlert(userId, event, "Bits")
            })
        } catch (error) {
            console.log("Fehler beim abfangen der Bits: ", error)
        }

        // Sub Alert
        try {
            eventSubListener.onChannelSubscription(userId, async (event) => {
                if (event.isGift) {
                    console.log(event.isGift)
                    return
                }
                Alerts.saveAlert(userId, event, "Subscriber")
            })
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen des Subscribers: " + error))
        }

        try {
            eventSubListener.onChannelSubscriptionMessage(userId, async (event) => {
                Alerts.saveAlert(userId, event, "Fortlaufende Subscriber")
            })
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen der Sub Verlängerung: " + error))
        }

        try {
            eventSubListener.onChannelSubscriptionGift(userId, async (event) => {
                Alerts.saveAlert(userId, event, "Subscriber Geschenke");
            });
        } catch (error) {
            console.log("Fehler beim abfangen der SubGifts: ", error)
        };
        console.log(chalk.green(`[SUCCESS] Subscriptions für ${userId} initiiert.`));
    } catch (error) {
        console.log(error.message)
    }
}