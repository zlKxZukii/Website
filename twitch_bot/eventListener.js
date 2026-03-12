import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import chalk from "chalk";

import { followProtection } from "./functions/spamProtection.js";
import { getAds } from "../obs_docks/ads/ads.js";
import { apiClient } from "../src/server.js";
import { HelixUserSubscription } from "@twurple/api";
import { ClientManager } from "./connectBot.js";
import { Select } from "../sql/sqlHandler.js";
import { sendFollow } from "../boxes/alert/follow.js";

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
        const followerObject = {
        }
        console.log(followerObject)
        const user = ClientManager.getClient(userId)
        const AlertDB = await Select.AlertBox([userId])
        for (const element of AlertDB) {
            if (element.type === "Follow") {
                Object.assign(followerObject, element.settings)
                followerObject.imagePath = element.settings.imagePath
                followerObject.soundPath = element.settings.soundPath
            }
        }
        console.log(followerObject)
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
        try {
            eventSubListener.onChannelFollow(userId, userId, async (event) => {
                await sendFollow(user, followerObject, event)
            })
        } catch (error) {
            console.log(chalk.red("Fehler beim abfangen der Follower: " + error))
        }

        console.log(chalk.green(`[SUCCESS] Subscriptions für ${userId} initiiert.`));
    } catch (error) {
        console.log(error.message)
    }
}