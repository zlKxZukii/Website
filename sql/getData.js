import { query } from '../src/server.js';

export async function getUsers(key){
    const sql = `
    SELECT username, twitch_id, bot_state FROM users WHERE login_key=$1
    `;
    const values = [
        key
    ]
    const res = await query(sql, values);
    return res.rows;
}

// function getToken() {
    
// }