import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import client from "./redisClient.js"
import express from "express";
import MainLayouts from "express-ejs-layouts"
import cookieParser from "cookie-parser";

import { app, PORT, httpServer } from "./server.js";

import { indexRoute } from "../index/indexRoute.js";
import { dashboardRoute } from "../dashboard/dashboardRoute.js";
// import { alertBoxRoute, alertBox, followBoxRoute } from "../boxes/alertBoxRoute.js";
import { securityRoute } from "../commands/securityRoute.js";
import { jokesRoute } from "../commands/jokeRoute.js";
import { commandsRoute } from "../commands/commandsRoute.js";
import { customCommandsRoute } from "../commands/customCommandsRoute.js";
import { intervallRoute } from "../commands/intervallPostRoute.js";
import { dataSecureRoute, impressumRoute } from "../legally/legallyRoute.js";
import { auth, twitch } from "../auth/twitchRoute.js";
import { ClientManager } from "../twitch_bot/connectBot.js";
// import { listRoute } from "../list/listRoute.js"
import chalk from "chalk";
import { Select } from "../sql/sqlHandler.js";
import { obsDocks } from "../obs_docks/obsDocksRoute.js";
import { adsRoute } from "../obs_docks/ads/adsRoute.js";

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
// app.use("/alertbox", alertBoxRoute)
// app.use("/alertbox", alertBox)
// app.use("/followbox", followBoxRoute)
// commands
app.use("/security", securityRoute)
app.use("/jokes", jokesRoute)
app.use("/commands", commandsRoute)
app.use("/customCommands", customCommandsRoute)
app.use("/dataSecure", dataSecureRoute)
app.use("/impressum", impressumRoute)
app.use("/Intervall", intervallRoute)
app.use("/auth", auth);
app.use("/auth/twitch", twitch);
app.use("/obsdocks", obsDocks)
app.use("/ads", adsRoute)
// app.use("/alertbox", alertBoxRoute)
// app.use("/list", listRoute)

app.use((req, res) => {
    res.status(404).render("../views/main/deadend.ejs", {
        title: "Dead End",
        css: "../css/dead_end.css",
        img: "../img/dead_end_owl.png",
        text: "Etwas ist schief gelaufen.",
        showBody: true
    });
});

httpServer.listen(PORT, async () => {
    console.log("Server gestartet auf Port " + PORT);
    const userData = await Select.UsersForStart("botState");
    for (let index = 0; index < userData.length; index++) {
        try {
            if (userData[index].bot_state) {
                await ClientManager.start(userData[index].username, userData[index].twitch_id);
            }
        } catch (error) {
            console.log(chalk.red(`${userData[index].username} konnte nicht gestartet werden!`));
        };
    };
});