import dotenv from "dotenv";
dotenv.config({ path: './src/.env' });
import { createHelixClient } from "../twitch_bot/createAPIclient.js"; 
import { getAuthProvider } from "./createRefreshToken.js";

export async function createCookie(res, tokenData,info, login_key) {
    const authProvider = await getAuthProvider(tokenData)
    const retUser = await createHelixClient(authProvider, info)
    res.cookie("access_validator", login_key, { signed: true, secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 * 24 * 14 })
    res.cookie("username", retUser.displayName, { signed: true, secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 * 24 * 14 })
    res.cookie("profilePic", retUser.profilePictureUrl, { signed: true, secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 * 24 * 14 })
}