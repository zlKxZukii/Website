import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });

import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import { getTokenInfo } from "@twurple/auth";

import crypto from "crypto";
import { loginUser, saveTwitchTokens } from "../sql/authUser.js";
import { scopes } from "./scopes.js";
import { createCookie } from "./createCookies.js";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

export async function authTwitch(code, ipAddress, res) {
    const login_key = crypto.randomBytes(12).toString("hex");

    const tokenData = await exchangeCode(clientId, clientSecret, code, REDIRECT_URI);
    const info = await getTokenInfo(tokenData.accessToken, clientId);

    await saveTwitchTokens(info.userId, tokenData, scopes);
    await loginUser(info.userId, info.userName, ipAddress, login_key)

    await createCookie(res,tokenData, info, login_key)
};

export async function getAuthProvider(tokenData) {
    const authProvider = new RefreshingAuthProvider({
        clientId,
        clientSecret,
        onRefresh: async (userId, newTokenData) =>
            await saveTwitchTokens(userId, newTokenData, scopes)
    });
    await authProvider.addUserForToken(tokenData, ['chat', 'api']);
    return authProvider;
};