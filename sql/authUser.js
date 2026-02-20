import { query } from '../src/server.js';

export async function saveTwitchTokens(twitchId, tokens, scopes) {
    const sql = `
        INSERT INTO tokens (
            twitch_id, 
            access_token, 
            refresh_token, 
            expires_in, 
            obtainment_timestamp, 
            scopes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (twitch_id) 
        DO UPDATE SET 
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            expires_in = EXCLUDED.expires_in,
            obtainment_timestamp = EXCLUDED.obtainment_timestamp,
            scopes = EXCLUDED.scopes,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [
        twitchId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn,
        tokens.obtainmentTimestamp,
        scopes
    ];

    try {
        const res = await query(sql, values);
        return res;
    } catch (err) {
        console.error("Fehler beim Speichern der Tokens:", err.message);
        throw err;
    }
}

export async function loginUser(twitchId, username, ip_address, login_key) {
    console.log(twitchId)
    const sql = `
        INSERT INTO users (
            twitch_id, 
            username, 
            ip_address,
            login_key
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (twitch_id) 
        DO UPDATE SET 
            twitch_id = EXCLUDED.twitch_id,
            username = EXCLUDED.username,
            ip_address = EXCLUDED.ip_address,
            login_key = EXCLUDED.login_key,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [
        twitchId,
        username,
        ip_address,
        login_key
    ];

    try {
        const res = await query(sql, values);
        return res;
    } catch (err) {
        console.error("Fehler beim Speichern der Tokens:", err.message);
        throw err;
    }
}