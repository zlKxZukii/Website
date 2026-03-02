import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { io } from "../src/server.js";
import { followProtection } from "./functions/spamProtection.js";
import { ClientManager } from "./connectBot.js";
import { getAds } from "../obs_docks/ads/ads.js";

export async function registerUserEvents(userID, key, apiClient) {

    const wsListener = new EventSubWsListener({
        apiClient
    });

    await wsListener.start()

    async function broadcastAdStatus(userId, apiClient, key, io) {
        const ads = await getAds(userId, apiClient);
        if (ads) {
            io.to(key).emit("new-add", {
                nextAd: ads.nextAdAt.getTime(), // Absoluter Zeitpunkt
                adNow: 0
            });
        }
    }

    // 2. Wenn der Stream online geht, initialen Status senden
    wsListener.onStreamOnline(userID, async () => {
        await broadcastAdStatus(userID, apiClient, key, io);
    });



    // 3. WICHTIG: Wenn eine Werbung startet, schickt Twitch dieses Event
    wsListener.onChannelAdBreakBegin(userID, (event) => {
        io.to(key).emit("ad-started", {
            adNow: event.duration // Die echte Länge der jetzt startenden Werbung
        });

        // Wenn die Werbung vorbei ist, holen wir uns den neuen Plan für die NÄCHSTE Werbung
        setTimeout(() => {
            broadcastAdStatus(userID, apiClient, key, io);
        }, (event.duration + 2) * 1000);
    });

    wsListener.onChannelAdBreakSnooze(userID, async (event) => {
        // Twitch sagt uns hier: "Neue Zeit ist X, du hast noch Y Snoozes übrig"
        console.log("Snooze gedrückt! Neue Zeit:", event.nextAdAt);

        // Wir rufen einfach unsere Funktion von oben auf
        await broadcastAdStatus(userID, apiClient, key, io);

        // Optional: Dem Dock ein extra Signal geben, dass gesnoozed wurde
        io.to(key).emit("new-add", {
            nextAdAt: event.nextAdAt.getTime(),
            snoozeCount: event.snoozeCount // Wie oft du noch drücken darfst
        });
    });

    wsListener.onStreamOffline(userID, async () => {
        await wsListener.stop();
    });

    // // Follow
    // wsListener.onChannelFollow(userID, userID, async event => {
    //     try {
    //         const client = ClientManager.client.get(userID)
    //         let check = await followProtection(client, event, userID)
    //         if (check == "true") {
    //             io.to(key).emit("new-alert", {
    //                 alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
    //                 beforeText: `Neuer Follower: ${event.userDisplayName}`,
    //             });
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // })

    // // Bits
    // wsListener.onChannelBitsUse(userID, event => {
    //     io.to(key).emit("new-alert", {
    //         alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
    //         beforeText: `Bits: ${event.userDisplayName}`,
    //     });
    // })

    // // Sub
    // wsListener.onChannelSubscription(userID, event => {
    //     io.to(key).emit("new-alert", {
    //         alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
    //         beforeText: `Neuer Sub: ${event.userDisplayName}, ${event.tier}`,
    //     });
    // });

    // // GiftSub
    // wsListener.onChannelSubscriptionGift(userID, event => {
    //     io.to(key).emit("new-alert", {
    //         alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
    //         beforeText: `Gifted Sub von ${event.userDisplayName}, gesamt: ${event.amount}`,
    //     });
    // });

    // // Raid
    // wsListener.onChannelRaidFrom(userID, event => {
    //     io.to(key).emit("new-alert", {
    //         alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
    //         beforeText: `Raid von ${event.userDisplayName} mit ${event.viewers} Viewern`,
    //     });
    // });

    return wsListener
}