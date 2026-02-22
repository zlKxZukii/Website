import { query } from '../src/server.js';

export async function getUsers(key) {
    const sql = `
    SELECT username, twitch_id, bot_state, picture_url FROM users WHERE login_key=$1
    `;
    const values = [
        key
    ]
    const res = await query(sql, values);
    return res.rows[0];
}

export async function getToken(userID) {
    const sql = `
    SELECT * FROM tokens WHERE twitch_id=$1
    `
    const values = [
        userID
    ]

    const res = await query(sql, values);
    return {
        accessToken: res.rows[0].access_token,
        expiresIn: res.rows[0].expires_in,
        obtainmentTimestamp: res.rows[0].obtainment_timestamp,
        refreshToken: res.rows[0].refresh_token,
        scope: res.rows[0].scopes
    };
}

export async function getAlertBox(userId) {
    const sql = `SELECT * FROM alert_box WHERE twitch_id=$1`
    const values = [
        userId
    ]

    const res = await query(sql, values);
    return res.rows[0]
}

export async function getJokesWithTrigger(category) {
    const sql = `SELECT response_text, triggers FROM jokes WHERE category ILIKE $1`

    const values = [
        category
    ]

    const res = await query(sql, values);
    return res.rows
}

export async function getJokeDataForUser(twitch_id) {
    const sql = `SELECT DISTINCT ON (cj.category) 
        cj.category, cj.state, j.triggers 
    FROM 
        commands.jokes cj 
    INNER JOIN
         public.jokes j ON cj.category=j.category
    WHERE
        twitch_id = $1;`

    const values = [
        twitch_id
    ]
    try {
        const res = await query(sql, values);
        return res.rows
    } catch (error) {
        console.log(error)
    }
}

export async function getAllJokes(category) {
    console.log(category)
    const sql =`SELECT 
                    response_text 
                FROM
                    jokes 
                WHERE category ILIKE $1`
    const values = [
        category
    ]
    const res = await query(sql, values);
    return res.rows
}