import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import { getTokenInfo } from "@twurple/auth";

import crypto from "crypto";
import { Auth, Select } from "../sql/sqlHandler.js";
import { scopes } from "./scopes.js";
import { createCookie } from "./createCookies.js";
import { createHelixClient } from "../twitch_bot/createAPIclient.js";
import client from "../src/redisClient.js";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

export async function authTwitch(code, ipAddress, res) {
    try {
        const tokenData = await exchangeCode(clientId, clientSecret, code, REDIRECT_URI);
        const authProvider = await getAuthProvider(tokenData);
        const info = await getTokenInfo(tokenData.accessToken, clientId);
        const user = await createHelixClient(authProvider, info.userId);

        const loginKey = crypto.randomBytes(64).toString("base64url");
        const redisKey = `sess:${loginKey}`
        await client.set(redisKey, JSON.stringify({
            userId: user.id,
            username: user.displayName,
            profilePicture: user.profilePictureUrl,
        }), { EX: 1209600 })

        const DB = await Select.AccessShield([info.userId])
        if (!DB) {
            const category = ["Follow Schutz", "Nachrichten Schutz", "Automatisches Clipen"]
            for (let index = 0; index < category.length; index++) {
                Insert.AccessShield([info.userId], category[index], false)
            }
        }
        await Auth.saveTwitchTokens(info.userId, tokenData, scopes);
        const loginRes = await Auth.loginUser(info.userId, info.userName, ipAddress, loginKey, user.profilePictureUrl)
        const oldKey = loginRes.rows[0]?.old_key;
        if (oldKey) {
            await client.del(`sess:${oldKey}`);
        }

        await createCookie(res, loginKey);
    } catch (error) {
        console.log(error)
        res.redirect("/")
    }
};

export async function getAuthProvider(tokenData) {
    const authProvider = new RefreshingAuthProvider({
        clientId,
        clientSecret,
        onRefresh: async (userId, newTokenData) =>
            await Auth.saveTwitchTokens(userId, newTokenData, scopes)
    });
    await authProvider.addUserForToken(tokenData, ['chat', 'api']);
    return authProvider;
};