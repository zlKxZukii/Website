import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import { EventSubWsListener } from '@twurple/eventsub-ws';
import { io } from "../src/server.js";
import { followProtection } from "./functions/spamProtection.js";
import { ClientManager } from "./connectBot.js";
import { getAds } from "../obs_docks/ads/ads.js";

export async function registerUserEvents(userID, keys, apiClient) {
    const {obsDocksKeys, alertBoxKey} = keys
    
    try {
        const subs = await apiClient.eventSub.getSubscriptions();
        if (subs.data.length > 0) {
            console.log("Bereinige alte EventSub-Abos...");
            await apiClient.eventSub.deleteAllSubscriptions();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.log("Hinweis beim Aufräumen: " + error.message);
    }

    const wsListener = new EventSubWsListener({
        apiClient,
        deleteAllOnStart: true
    });

    await wsListener.start()

    wsListener.onStreamOnline(userID, async (event) => {
        console.log("Stream Online von", event.broadcasterDisplayName)
    })

    wsListener.onStreamOffline(userID, async (event) => {
        console.log("Stream Offline von", event.broadcasterDisplayName)
    })

    wsListener.onChannelAdBreakBegin(userID, async (data) => {
        console.log(data.broadcasterDisplayName)
        console.log(data.startDate.getMinutes())
        console.log(data.broadcasterName)
        io.to(obsDocksKeys.ads).emit("new-add", {
            adNow: data.startDate.getSeconds()
        });
    })



    // async function broadcastAdStatus(userId, apiClient, key, io) {
    //     console.log("ads abfrage gestartet")
    //     const ads = await getAds(userId, apiClient);
    //     console.log(ads)
    //     if (ads && ads.nextAdAt) {
    //         io.to(key).emit("new-add", {
    //             nextAd: ads.nextAdAt.getTime(), // Sicher, da oben geprüft
    //             adNow: 0
    //         });
    //     } else {
    //         // Fallback: Wenn keine Werbung geplant ist, schick 0 an das Frontend
    //         // Damit das Frontend nicht auf ein Datum wartet, das nie kommt.
    //         io.to(key).emit("new-add", {
    //             nextAd: 0,
    //             adNow: 0,
    //             noData: true // Optionales Flag für dein Frontend
    //         });
    //         console.log("Ad-Status: Aktuell kein Werbezeitplan verfügbar (leere API-Antwort).");
    //     }
    // }

    // // 2. Wenn der Stream online geht, initialen Status senden

    // await wsListener.onStreamOnline(userID, async () => {
    //     console.log("Stream ist online! Warte 5s auf Ad-Daten...");
    //     wsListener.onSubscriptionCreateSuccess((sub) => {
    //         console.log(`[VERBINDUNG] Abo erfolgreich erstellt: ${sub.type}`);
    //     });
    //     setTimeout(async () => {
    //         await broadcastAdStatus(userID, apiClient, key, io);
    //     }, 5000); // 5 Sekunden Puffer
    // });



    // // 3. WICHTIG: Wenn eine Werbung startet, schickt Twitch dieses Event
    // wsListener.onChannelAdBreakBegin(userID, (event) => {
    //     io.to(key).emit("ad-started", {
    //         adNow: event.duration // Die echte Länge der jetzt startenden Werbung
    //     });

    //     // Wenn die Werbung vorbei ist, holen wir uns den neuen Plan für die NÄCHSTE Werbung
    //     setTimeout(() => {
    //         broadcastAdStatus(userID, apiClient, key, io);
    //     }, (event.duration + 2) * 1000);
    // });

    // wsListener.onStreamOffline(userID, async () => {
    //     await wsListener.stop();
    // });









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