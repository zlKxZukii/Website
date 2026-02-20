import dotenv from "dotenv";
dotenv.config({ path: './src/.env' })

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

export const app = express();
export const PORT = 3000;
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    } // Wichtig für OBS Browser-Quellen
});

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
console.log("--- DER BOT STARTET JETZT ---");
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_NAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

// Kurzer Verbindungstest beim Start
try {
    pool.on('connect', () => {
        console.log('✅ Datenbank-Pool verbunden');
    });
} catch (error) {
    console.log(error)
}

export const query = (text, params) => pool.query(text, params);