import dotenv from "dotenv";
dotenv.config({ path: './src/.env', quiet: true });

import express from "express";
import MainLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import chalk from "chalk";

import { app, PORT, httpServer, eventSubListener, initializeTwurple, apiClient } from "./server.js";


import { indexRoute } from "../index/indexRoute.js";
import { dashboardRoute } from "../dashboard/dashboardRoute.js";
import { alertBoxRoute } from "../boxes/alertBoxRoute.js";
import { securityRoute } from "../commands/securityRoute.js";
import { jokesRoute } from "../commands/jokeRoute.js";
import { commandsRoute } from "../commands/commandsRoute.js";
import { customCommandsRoute } from "../commands/customCommandsRoute.js";
import { intervallRoute } from "../commands/intervallPostRoute.js";
import { dataSecureRoute, impressumRoute } from "../legally/legallyRoute.js";
import { auth, twitch } from "../auth/twitchRoute.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
import { Select } from "../sql/sqlHandler.js";
import { obsDocks } from "../obs_docks/obsDocksRoute.js";
import { adsRoute } from "../obs_docks/ads/adsRoute.js";

import { browserToolsRoute } from "../browserTools/browserToolsRoute.js";
import { clipPlayerRoute } from "../browserTools/tools/clipPlayerRoute.js"
import { test } from "./testRoute.js";
import { FollowBoxRoute } from "../boxes/followerBoxRoute.js";
import { SubscriberBoxRoute } from "../boxes/subscriberBoxRoute.js";
import { RaidBoxRoute } from "../boxes/raidBoxRoute.js";

// --- INITIALISIERUNGS-LOGIK ---

async function startServer() {
    try {

        // 1. Twurple initialisieren (Wichtig: await!)
        await initializeTwurple();
        await nukeAllSubscriptions(apiClient)
        eventSubListener.apply(app)

        app.set('trust proxy', 1)

        app.use(express.json({ limit: '10kb' }));
        app.use(express.urlencoded({ extended: true }));
        app.use(cookieParser(process.env.COOKIE_SECRET));

        app.use(express.static("views/public"));
        app.set("view engine", "ejs");
        app.use(MainLayouts);
        app.set("layout", "layouts/html");
        app.set('trust proxy', 1);

        // 4. Routen einbinden
        app.use("/", indexRoute);
        app.use("/uploads", express.static('uploads'))
        app.use("/dashboard", dashboardRoute);
        app.use("/alertbox", alertBoxRoute);
        app.use("/follows", FollowBoxRoute);
        app.use("/subs", SubscriberBoxRoute);
        app.use("/raid", RaidBoxRoute);
        app.use("/security", securityRoute);
        app.use("/jokes", jokesRoute);
        app.use("/commands", commandsRoute);
        app.use("/customcommands", customCommandsRoute);
        app.use("/dataSecure", dataSecureRoute);
        app.use("/impressum", impressumRoute);
        app.use("/Intervall", intervallRoute);
        app.use("/auth", auth);
        app.use("/auth/twitch", twitch);
        app.use("/obsdocks", obsDocks);
        app.use("/ads", adsRoute);
        app.use("/test", test)
        app.use("/browsertools", browserToolsRoute)
        app.use("/clipsplayer", clipPlayerRoute)

        // 404 Handler
        app.use((req, res) => {
            res.status(404).render("../views/main/deadend.ejs", {
                title: "Dead End", css: "../css/dead_end.css",
                img: "../img/dead_end_owl.png", text: "Etwas ist schief gelaufen.", showBody: true
            });
        });

        // 5. HTTP Server starten
        httpServer.listen(PORT, async () => {
            await eventSubListener.markAsReady();
            console.log(chalk.green(`✔ Server läuft auf Port ${PORT}`));
            await runPostStartLogic();
        });

    } catch (error) {
        console.error(chalk.red("!!! Fataler Fehler beim Start !!!"), error);
        process.exit(1); // Verhindert endlosen PM2-Loop bei echtem Code-Fehler
    }
}

// --- LOGIK NACH DEM START ---

async function runPostStartLogic() {
    try {
        // Optional: Kurze Pause, damit Nginx/Proxy bereit sind
        await new Promise(resolve => setTimeout(resolve, 3000));

        // User aus DB holen
        const userData = await Select.UsersForStart("botState");
        console.log(chalk.yellow(`${userData.length} User aus Datenbank geladen.`));

        // Subscriptions und Bot-Verbindungen nacheinander abarbeiten (stabiler als map/Promise.all)
        for (const user of userData) {
            if (!user.bot_state) continue;

            try {
                // Erst Webhook abonnieren
                // Dann Chat-Bot verbinden
                await ClientManager.start(user.username, user.twitch_id);

                console.log(chalk.cyan(`[READY] ${user.username} (ID: ${user.twitch_id})`));
            } catch (error) {
                console.error(chalk.red(`[FAIL] ${user.username}:`), error.message);
            }
        };

        // Finaler Sync-Check
        const finalSubs = await apiClient.eventSub.getSubscriptions();
        console.log(chalk.bold(`Aktive Subscriptions bei Twitch: ${finalSubs.total}`));
        console.log(chalk.green("System erfolgreich synchronisiert."));

    } catch (error) {
        console.error(chalk.red("Fehler in der Post-Start Logik:"), error);
    }
}


// EXECUTION
startServer();

async function nukeAllSubscriptions(apiClient) {
    try {
        console.log(chalk.bold.red("\n--- SUBSCRIPTION NUKE GESTARTET ---"));

        // 1. Alle Subscriptions von Twitch abrufen
        const paginator = apiClient.eventSub.getSubscriptionsPaginated();
        const allSubs = await paginator.getAll();

        if (allSubs.length === 0) {
            console.log(chalk.green("Keine aktiven Subscriptions zum Löschen gefunden."));
            return;
        }

        console.log(chalk.yellow(`${allSubs.length} Subscriptions werden jetzt gelöscht...`));

        // 2. In 5er-Schritten löschen, um Ratelimits zu vermeiden
        for (let i = 0; i < allSubs.length; i += 5) {
            const batch = allSubs.slice(i, i + 5);

            await Promise.all(
                batch.map(async (sub) => {
                    try {
                        await apiClient.eventSub.deleteSubscription(sub.id);
                        console.log(chalk.gray(`  [DELETED] ${sub.type} (ID: ${sub.id})`));
                    } catch (e) {
                        console.error(chalk.red(`  [FAILED] ID: ${sub.id}`), e.message);
                    }
                })
            );

            // Ganz kurze Pause zwischen den Batches
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(chalk.bold.green("--- NUKE ERFOLGREICH: Alle Subs entfernt ---\n"));

    } catch (error) {
        console.error(chalk.bgRed.white(" FATALER FEHLER BEIM NUKEN: "), error);
    }
}