import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import express from "express";
import MainLayouts from "express-ejs-layouts"
import cookieParser from "cookie-parser";

import { app, PORT, httpServer } from "./server.js";
import { getDataForServerStart, InitializeFirebaseApp } from "./firebase.js";

import { indexRoute } from "../index/indexRoute.js";
import { dashboardRoute } from "../dashboard/dashboardRoute.js";
import { alertBoxRoute, alertBox, followBoxRoute } from "../boxes/alertBoxRoute.js";
import { functionsRoute } from "../commands/functionsRoute.js";
import { jokesRoute } from "../commands/jokeRoute.js";
import { commandsRoute } from "../commands/commandsRoute.js";
import { customCommandsRoute } from "../commands/customCommandsRoute.js";
import { customCommandDataRoute } from "../commands/dataRoutes/customCommandDataRoute.js";
import { commandDataRoute } from "../commands/dataRoutes/commandDataRoute.js";
import { intervallRoute } from "../commands/intervallPostRoute.js";
import { getBotState } from "../dashboard/data/botState.js";
import { dataSecureRoute, impressumRoute } from "../legally/legallyRoute.js";
import { auth, twitch } from "../auth/twitchRoute.js";
import { botManager } from "../twitch_bot/connectBot.js";
import {listRoute} from "../list/listRoute.js"

InitializeFirebaseApp()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static("views/public"))
app.set("view engine", "ejs")
app.use(MainLayouts)
app.set("layout", "layouts/html")
app.set('trust proxy', 1)

app.use("/", indexRoute)
app.use("/dashboard", dashboardRoute)
app.use("/alertbox", alertBoxRoute)
app.use("/alertbox",alertBox)
app.use("/followbox", followBoxRoute)
// commands
app.use("/functions", functionsRoute)
app.use("/jokes", jokesRoute)
app.use("/commands", commandsRoute)
app.use("/customCommands", customCommandsRoute)
app.use("/dataSecure", dataSecureRoute)
app.use("/impressum", impressumRoute)
app.use("/data", commandDataRoute)
app.use("/customdata", customCommandDataRoute)
app.use("/Intervall", intervallRoute)
app.use("/bot", getBotState)
app.use("/auth", auth)
app.use("/auth/twitch", twitch)
app.use("/alertbox", alertBoxRoute)
app.use("/list", listRoute)

app.use((req, res) => {
    res.status(404).render("../views/main/deadend.ejs", {
        title: "Dead End",
        css: "../css/dead_end.css",
        img: "../img/dead_end_owl.png",
        text: "Etwas ist schief gelaufen.",
        showBody: true
    })
})

httpServer.listen(PORT, async () => {
    console.log("Server gestartet und ist auf Port " + PORT + " erreichbar")

    const userData = await getDataForServerStart("botState")

    for (let index = 0; index < Object.keys(userData).length; index++) {
        try {
            if (userData[index].state.state) {
                await botManager.start(userData[index].username, userData[index].userID)
            }
        } catch (error) {
            console.log("Error from Bot START: " + userData[index].username + "" + error)
        }

    }
    console.log("All Bots are online.")
})