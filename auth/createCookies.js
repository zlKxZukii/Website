import dotenv from "dotenv";
dotenv.config({
    path: './src/.env', quiet: true
});

export async function createCookie(res, login_key) {
    res.cookie("access_validator", login_key, {
        domain: process.env.DOMAIN,
        signed: true,
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1209600000
    });
}