import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import chalk from "chalk";
import { createClient } from "redis";

const redisURL = process.env.REDIS_URL
const redisPORT = process.env.REDIS_PORT
const client = createClient({ url: redisURL + redisPORT });

client.on('error', err => console.error(chalk.red('Redis Error', err)));
client.on('ready', () => console.log(chalk.green('Redis: Bereit und verbunden!')));

try {
    await client.connect();
} catch (err) {
    console.error('❌ Redis konnte nicht verbunden werden:', err);
}

export default client;