import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import pkg from 'pg';
import chalk from "chalk";
const { Pool } = pkg;

export const app = express();
export const PORT = 3000;
export const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

export let apiClient;
export let eventSubListener;

export async function initializeTwurple() {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const authProvider = new AppTokenAuthProvider(clientId, clientSecret);
    await authProvider.getAppAccessToken()
    apiClient = new ApiClient({ authProvider });

    try {
        eventSubListener = new EventSubMiddleware({
            apiClient,
            hostName: 'scaletta.live',
            pathPrefix: '/eventsub',
            secret: process.env.EVENTSUB_SECRET
        });

        console.log(chalk.magenta("EventSubListener wurde fehlerfrei erstellt."));
    } catch (e) {
        console.error(chalk.red("Fehler direkt im Listener-Constructor:"), e.message);
    }
}

io.on("connection", (socket) => {
    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`AlertBox von ${room} beigetreten.`);
    });
    socket.on("disconnect", (reason) => {
        console.log("client disconnected reason:", reason);
    });
    socket.on('error', (err) => {
        console.error("Socket Fehler: ", err);
    });
});

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_NAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
    client_encoding: 'UTF8'
});

// Kurzer Verbindungstest beim Start
try {
    pool.on('connect', () => {
        console.log(chalk.green('Datenbank-Pool verbunden'));
    });
} catch (error) {
    console.log(error)
}

export const query = (text, params) => pool.query(text, params);