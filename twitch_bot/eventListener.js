import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { io } from "../src/server.js";
import { followProtection } from "./functions/spamProtection.js";
import { botManager } from "./connectBot.js";

export async function registerUserEvents(username, userID, key, apiClient) {

    const wsListener = new EventSubWsListener({
        apiClient
    });

    await wsListener.start()

    // Follow
    wsListener.onChannelFollow(userID, userID, async event => {
        try {
            const client = botManager.client.get(userID)
            let check = await followProtection(client, event, userID)
            if (check == "true") {
                io.to(key).emit("new-alert", {
                    alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
                    beforeText: `Neuer Follower: ${event.userDisplayName}`,
                });
            }
        } catch (error) {
            console.log(error)
        }
    })

    // Bits
    wsListener.onChannelBitsUse(userID, event => {
        io.to(key).emit("new-alert", {
            alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
            beforeText: `Bits: ${event.userDisplayName}`,
        });
    })

    // Sub
    wsListener.onChannelSubscription(userID, event => {
        io.to(key).emit("new-alert", {
            alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
            beforeText: `Neuer Sub: ${event.userDisplayName}, ${event.tier}`,
        });
    });

    // GiftSub
    wsListener.onChannelSubscriptionGift(userID, event => {
        io.to(key).emit("new-alert", {
            alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
            beforeText: `Gifted Sub von ${event.userDisplayName}, gesamt: ${event.amount}`,
        });
    });

    // Raid
    wsListener.onChannelRaidFrom(userID, event => {
        io.to(key).emit("new-alert", {
            alertImg: "<img src='../img/alert-box/owl.gif' alt=''>",
            beforeText: `Raid von ${event.userDisplayName} mit ${event.viewers} Viewern`,
        });
    });

    return wsListener
}