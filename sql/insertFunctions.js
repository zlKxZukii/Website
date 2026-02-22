import chalk from "chalk";
import { query } from "../src/server.js"

export async function alertBoxKey(twitch_id, alert_key) {
    const sql = `
    INSERT INTO alert_box (
        twitch_id,
        alert_key
    )
    VALUES($1, $2)
    ON CONFLICT (twitch_id)
    DO UPDATE SET
    twitch_id = EXCLUDED.twitch_id,
    alert_key = EXCLUDED.alert_key,
    updated_at = NOW()
    RETURNING *
    `;

    const values = [
        twitch_id,
        alert_key
    ];

    try {
        const res = await query(sql, values);
        return res;
    } catch (error) {
        console.error("Alert Key ist nicht gespeichert worden", error)
    }
}

export async function jokeState(twitch_id, category, state = false) {
    const sql = `
    INSERT INTO commands.jokes (
        twitch_id,
        category,
        state
    )
    VALUES($1, $2, $3)
    ON CONFLICT (twitch_id, category)
    DO UPDATE SET
    state = EXCLUDED.state,
    updated_at = NOW()
    RETURNING *
    `;

    const values = [
        twitch_id,
        category,
        state
    ];

    try {
        const res = await query(sql, values);
        return res;
    } catch (error) {
        console.error(chalk.red("Benutzer konnte nicht gespeichert werden.", error))
    }
}