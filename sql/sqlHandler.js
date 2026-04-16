import chalk from "chalk";
import { query } from "../src/server.js"

class InsertSQL {
    static whitelist = [
        'username',
        'twitch_id',
        'category',
        'response_text',
        'cooldown',
        'delay',
        'state',
        'triggers'
    ];

    async BotState(valuesArray) {
        try {
            const sql = `INSERT INTO users AS u(
                            twitch_id,
                            bot_state,
                            username)
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id)
                        DO UPDATE SET
                        bot_state = EXCLUDED.bot_state,
                        updated_at = NOW()
                        RETURNING u.*;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Bot State nicht gespeichert" + error.message))
        }
    }

    async CreateAlertBox(valuesArray) {
        try {
            const sql = `INSERT INTO alert_box AS ab (
                            twitch_id,
                            type,
                            settings,
                            image_path,
                            sound_path
                        )
                        VALUES($1, $2, $3, $4, $5)
                        ON CONFLICT (twitch_id, type)
                        DO UPDATE SET
                            settings = ab.settings || EXCLUDED.settings,
                            updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Alert Box nicht gespeichert " + error.message))
        }
    }

    async UpdateAlertBoxSettings(valuesArray) {
        try {
            const sql = `INSERT INTO alert_box AS ab (
                            twitch_id,
                            type,
                            settings
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, type)
                        DO UPDATE SET
                            settings = ab.settings || EXCLUDED.settings,
                            updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Alert Box nicht gespeichert " + error.message))
        }
    }

        async UpdateAlertBoxImage(valuesArray) {
        try {
            const sql = `INSERT INTO alert_box (
                            twitch_id,
                            type,
                            image_path
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, type)
                        DO UPDATE SET
                            image_path = EXCLUDED.image_path,
                            updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Alert Box nicht gespeichert " + error.message))
        }
    }

    async UpdateAlertBoxSound(valuesArray) {
        try {
            const sql = `INSERT INTO alert_box AS ab (
                            twitch_id,
                            type,
                            sound_path
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, type)
                        DO UPDATE SET
                            sound_path = EXCLUDED.sound_path,
                            updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Alert Box nicht gespeichert " + error.message))
        }
    }

    async AlertBoxKey(valuesArray) {
        try {
            const sql = `INSERT INTO alert_box_key (
                            twitch_id,
                            key
                        )
                        VALUES($1, $2)
                        ON CONFLICT (twitch_id)
                        DO UPDATE SET
                            key = EXCLUDED.key,
                            updated_at = NOW()
                        RETURNING*;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Alert Key nicht gespeichert " + error.message))
        }
    }

    async obsDocks(valuesArray) {
        try {
            const sql = `INSERT INTO obs_docks AS od(
                            twitch_id,
                            category,
                            keys)
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, category)
                        DO UPDATE SET
                        keys = EXCLUDED.keys,
                        updated_at = NOW()
                        RETURNING od.*;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("OBS Dock Key nicht gespeichert " + error.message))
        }
    }

    // defaultCommands
    async CreateDefCommands(valuesArray) {
        try {
            const sql = `
            INSERT INTO def_commands AS dc (
                twitch_id,
                category,
                triggers,
                settings
                )
            VALUES($1, $2, $3, $4)
            ON CONFLICT (twitch_id, category)
            DO UPDATE SET
                triggers = EXCLUDED.triggers,
                settings = EXCLUDED.settings,
                updated_at = NOW()
            RETURNING dc.*;`;
            const res = await query(sql, valuesArray);
            await this.setDefPermissions(valuesArray[0], valuesArray[1]);
            return res;
        } catch (error) {
            console.log(chalk.red("Default Commands konnten nicht erstellt werden ", error.message));
        };
    };
    async setDefPermissions(twitch_id, category) {
        try {
            const sql = `
            INSERT INTO def_permissions AS dp (
                twitch_id,
                category
                )
            VALUES($1, $2)
            ON CONFLICT (twitch_id, category)
            DO UPDATE SET
                updated_at = NOW()
            RETURNING dp.*;`;
            const values = [
                twitch_id,
                category
            ];
            const res = await query(sql, values);
            return res;
        } catch (error) {
            console.log(chalk.red("Default Permissions konnten nicht erstellt werden ", error.message));
        };
    };
    async updateDefCommand(valuesArray) {
        try {
            const sql = `WITH update_def_commands AS (
                        UPDATE def_commands
                        SET
                            response_text = $3,
                            settings =$4::jsonb,
                            state = $5,
                            updated_at = NOW()
                        WHERE twitch_id = $1
                        AND category = $2
                        RETURNING twitch_id, category
                        )
                        UPDATE def_permissions AS dp
                        SET
                            anybody = $6,
                            broadcaster = $7,
                            moderator = $8,
                            subscriber = $9,
                            vip = $10,
                            updated_at = NOW()
                        FROM update_def_commands AS udc
                        WHERE dp.twitch_id = udc.twitch_id
                        AND dp.category = udc.category
                        RETURNING dp.*;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Fehler beim Updaten von Def Commands ", error.message));
        };
    };

    // custom commands
    async CreateCustomCommands(valuesArray) {
        try {
            const sql = `
            INSERT INTO custom_commands AS cc (
                twitch_id,
                category,
                response_text,
                triggers
                )
            VALUES($1, $2, $3, $4)
            ON CONFLICT (twitch_id, category)
            DO UPDATE SET
                response_text = EXCLUDED.response_text,
                triggers = EXCLUDED.triggers,
                updated_at = NOW()
            RETURNING cc.*;`;
            const res = await query(sql, valuesArray);
            await this.setCustomPermissions(valuesArray[0], valuesArray[1]);
            return res;
        } catch (error) {
            console.log(chalk.red("Default Commands konnten nicht erstellt werden ", error.message));
        };
    };
    async setCustomPermissions(twitch_id, category) {
        try {
            const sql = `
            INSERT INTO custom_permissions AS cp (
                twitch_id,
                category
                )
            VALUES($1, $2)
            ON CONFLICT (twitch_id, category)
            DO UPDATE SET
                updated_at = NOW()
            RETURNING cp.*;`;
            const values = [
                twitch_id,
                category
            ];
            const res = await query(sql, values);
            return res;
        } catch (error) {
            console.log(chalk.red("Default Permissions konnten nicht erstellt werden ", error.message));
        };
    };
    async UpdateCustomCommands(valuesArray) {
        try {
            const sql = `WITH update_custom_commands AS (
                        UPDATE custom_commands
                        SET
                            response_text = $3,
                            cooldown = $4,
                            delay = $5,
                            state = $6,
                            updated_at = NOW()
                        WHERE twitch_id = $1
                        AND category = $2
                        RETURNING twitch_id, category
                        )
                        UPDATE custom_permissions AS cp 
                        SET
                            anybody = $7,
                            broadcaster = $8,
                            moderator = $9,
                            subscriber = $10,
                            vip = $11,
                            updated_at = NOW()
                        FROM update_custom_commands AS ucc
                        WHERE cp.twitch_id = ucc.twitch_id
                        AND cp.category = ucc.category;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.log(chalk.red("Fehler beim Updaten ", error.message));
        };
    }

    async CreateIntervall(valuesArray) {
        try {
            const sql = `
            INSERT INTO intervall AS i (
                twitch_id,
                category,
                response_text,
                intervall,
                state
                )
            VALUES($1, $2, $3, $4, $5)
            ON CONFLICT (twitch_id, category)
            DO UPDATE SET
                response_text = EXCLUDED.response_text,
                intervall = EXCLUDED.intervall,
                state = EXCLUDED.state,
                updated_at = NOW()
            RETURNING i.*;`;
            const res = await query(sql, valuesArray);
            await this.setCustomPermissions(valuesArray[0], valuesArray[1]);
            return res;
        } catch (error) {
            console.log(chalk.red("Intervall konnten nicht erstellt werden ", error.message));
        };
    }

    // jokes
    async jokeState(valuesArray) {
        try {
            const sql = `INSERT INTO joke_states (
                            twitch_id,
                            category,
                            state
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, category)
                        DO UPDATE SET
                        state = EXCLUDED.state,
                        updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Benutzer konnte nicht gespeichert werden.", error));
        };
    };

    async AccessShield(valuesArray) {
        try {
            const sql = `INSERT INTO access_shield (
                            twitch_id,
                            category,
                            state
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, category)
                        DO UPDATE SET
                        state = EXCLUDED.state,
                        updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Benutzer konnte nicht gespeichert werden.", error));
        };
    }
    async CreateBrowserTool(valuesArray) {
        try {
            const sql = `INSERT INTO browser_tools (
                            twitch_id,
                            type,
                            key
                        )
                        VALUES($1, $2, $3)
                        ON CONFLICT (twitch_id, "type", "key")
                        DO UPDATE SET
                        updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Tool konnte nicht gespeichert werden.", error));
        };
    }
    async UpdateBrowserJSON(valuesArray) {
        try {
            const sql = `INSERT INTO browser_tools (
                            twitch_id,
                            type,
                            settings,
                            "key"
                        )
                        VALUES($1, $2, $3, $4)
                        ON CONFLICT (twitch_id, "type", "key")
                        DO UPDATE SET
                        settings = EXCLUDED.settings,
                        updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Tool konnte nicht gespeichert werden.", error));
        };
    }

    async CreateGame(valuesArray) {
        try {
            const sql = `INSERT INTO games (
                            twitch_id,
                            game,
                            triggers,
                            key,
                            settings,
                            leaderboard
                        )
                        VALUES($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (twitch_id, game, "key")
                        DO UPDATE SET
                        updated_at = NOW()
                        RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Tool konnte nicht gespeichert werden.", error));
        };
    }
    async UpdateGame(valuesArray) {
        try {
            const sql = `
            INSERT INTO games (
                twitch_id, 
                game,
                settings
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (twitch_id, game) 
            DO UPDATE SET 
                settings = games.settings || EXCLUDED.settings,
                updated_at = NOW()
            RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Tool konnte nicht gespeichert werden.", error));
        };

    }
    async UpdateLeaderboard(valuesArray) {
        try {
            const sql = `
            INSERT INTO games (
                twitch_id, 
                game,
                "key", 
                leaderboard
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (twitch_id, game, "key") 
            DO UPDATE SET 
                leaderboard = games.leaderboard || EXCLUDED.leaderboard,
                updated_at = NOW()
            RETURNING *;`;
            const res = await query(sql, valuesArray);
            return res;
        } catch (error) {
            console.error(chalk.red("Tool konnte nicht gespeichert werden.", error));
        };
    }
};

class SelectSQL {

    constructor() {
        this.whitelist = ['username', 'twitch_id', 'bot_state', 'picture_url'];
    };

    async UsersForStart() {
        try {
            const sql = `SELECT username, twitch_id, bot_state FROM users; `;
            const res = await query(sql, []);

            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler im Starten aller User" + error.message));
        };
    }

    async Users(whitelistArray, valuesArray) {
        let injectString = ""
        for (const element of whitelistArray) {
            if (this.whitelist.includes(element)) {
                injectString += element + ", "
            };
        }
        try {
            const sql = `SELECT ${injectString.slice(0, -2) + " "}FROM users WHERE twitch_id = $1; `;

            const res = await query(sql, valuesArray);

            return res.rows[0];
        } catch (error) {
            console.log(chalk.red("Fehler im Select Statement" + error.message));
        };
    };

    async Token(valuesArray) {
        try {
            const sql = `SELECT * FROM tokens WHERE twitch_id = $1; `;
            const res = await query(sql, valuesArray);

            return {
                accessToken: res.rows[0].access_token,
                expiresIn: res.rows[0].expires_in,
                obtainmentTimestamp: res.rows[0].obtainment_timestamp,
                refreshToken: res.rows[0].refresh_token,
                scope: res.rows[0].scopes
            };
        } catch (error) {
            console.log(chalk.red("Fehler im Token " + error.message));
        };
    };

    async AlertBox(valuesArray) {
        try {
            const sql = `SELECT * FROM alert_box WHERE twitch_id = $1; `;
            const res = await query(sql, valuesArray);
            return res.rows;

        } catch (error) {
            console.log(chalk.red("AlertBox konnte nicht geladen werden " + error.message));
        };
    };

    async AlertBoxKey(valuesArray) {
        try {
            const sql = `SELECT key FROM alert_box_key WHERE twitch_id = $1; `;
            const res = await query(sql, valuesArray);
            return res.rows[0];

        } catch (error) {
            console.log(chalk.red("AlertBox konnte nicht geladen werden " + error.message));
        };
    };

    async obsDocks(valuesArray) {
        try {
            const sql = `SELECT * FROM obs_docks WHERE twitch_id = $1`;
            const res = await query(sql, valuesArray);
            return res.rows;

        } catch (error) {
            console.log(chalk.red("AlertBox konnte nicht geladen werden " + error.message));
        };
    }

    async JokesWithTrigger(valuesArray) {
        try {
            const sql = `SELECT response_text, triggers FROM jokes WHERE category ILIKE $1; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler beim empfangen der JOKE Liste " + error.message));
        };
    };
    async JokeDataForUser(valuesArray) {
        try {
            const sql = `SELECT DISTINCT ON(js.category)
        js.category, js.state, j.triggers
        FROM 
                            joke_states js
                        INNER JOIN
        public.jokes j ON js.category = j.category
        WHERE
        twitch_id = $1; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler beim Laden der JOKE Datenbank für den User" + error.message));
        };
    };
    async AllJokes(valuesArray) {
        try {
            const sql = `SELECT
        response_text
        FROM
        jokes 
                        WHERE category ILIKE $1; `;

            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler beim laden Der JOKE liste " + error.message));
        };
    };

    async Commands(valuesArray) {
        try {
            const sql = `SELECT
        dc.category,
            dc.response_text,
            dc.state,
            dc.triggers,
            dc.settings,
            dp.anybody,
            dp.broadcaster,
            dp.vip,
            dp.subscriber,
            dp.moderator
        FROM
                            def_commands AS dc
        JOIN 
                            def_permissions AS dp ON dc.twitch_id = dp.twitch_id AND dc.category = dp.category
        WHERE
        dc.twitch_id ILIKE($1); `;

            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler beim Laden der Commands" + error.message));
        };
    };


    async CustomCommand(valuesArray) {
        try {
            const sql = `SELECT  DISTINCT ON(cc.category)
        cc.category,
            cc.response_text,
            cc.cooldown,
            cc.delay,
            cc.state,
            cc.triggers,
            cp.anybody,
            cp.broadcaster,
            cp.vip,
            cp.subscriber,
            cp.moderator
        FROM
                            custom_commands AS cc
        JOIN 
                            custom_permissions AS cp ON cc.twitch_id = cp.twitch_id AND cc.category = cp.category
        WHERE
        cc.twitch_id ILIKE($1) 
                        GROUP BY
        cc.category,
            cc.response_text,
            cc.cooldown,
            cc.delay,
            cc.state,
            cc.triggers,
            cp.anybody,
            cp.broadcaster,
            cp.vip,
            cp.subscriber,
            cp.moderator; `;

            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Fehler beim Laden der Custom Commands " + error.message));
        };
    };

    async Intervall(valuesArray) {
        try {
            const sql = `SELECT
        category,
            response_text,
            intervall,
            state
        FROM
        intervall
        WHERE
        twitch_id = $1; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        }
        catch (error) {
            console.log(chalk.red("Intervall kann nicht gefunden werden " + error.message));
        }
    }

    async AccessShield(valuesArray) {
        try {
            const sql = `SELECT
        category,
            state
        FROM
        access_shield
        WHERE
        twitch_id = $1; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        }
        catch (error) {
            console.log(chalk.red("Sicherheit nicht gefunden " + error.message));
        }
    }

    async GetBrowserToolsKey(valuesArray) {
        try {
            const sql = `SELECT
                            "key",
                            "type",
                            settings
                        FROM
                            browser_tools
                        WHERE
                            twitch_id = $1; `;
            const res = await query(sql, valuesArray)
            return res.rows;
        } catch (error) {
            console.log(chalk.red("BrowserToolsKey schmeißt einen Fehler: " + error))
        }
    }

    async GetUserIdFromTools(valuesArray) {
        try {
            const sql = `SELECT
                            bt.twitch_id,
                            username
                        FROM
                            browser_tools bt
                        JOIN
                            users u
                        ON
                            bt.twitch_id = u.twitch_id
                        WHERE
                            key = $1;`
            const res = await query(sql, valuesArray)
            return res.rows[0];
        } catch (error) {
            console.log(error)
        }
    }

    async GetGames(valuesArray) {
        try {
            const sql = `SELECT
                            *
                        FROM
                            games
                        WHERE
                            twitch_id = $1;`
            const res = await query(sql, valuesArray)
            return res.rows;
        } catch (error) {
            console.log(error)
        }
    }
    async GetGamesByKey(valuesArray) {
        try {
            const sql = `SELECT
                            *
                        FROM
                            games
                        WHERE
                            "key" = $1;`
            const res = await query(sql, valuesArray)
            return res.rows;
        } catch (error) {
            console.log(error)
        }
    }
};

class AuthSQL {
    async saveTwitchTokens(twitchId, tokens, scopes) {
        try {
            const sql = `
        INSERT INTO tokens(
            twitch_id,
            access_token,
            refresh_token,
            expires_in,
            obtainment_timestamp,
            scopes
        )
        VALUES($1, $2, $3, $4, $5, $6)
        ON CONFLICT(twitch_id) 
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
            const res = await query(sql, values);
            return res;
        } catch (error) {
            console.error("Fehler beim Speichern der Tokens:" + error.message);
        };
    }

    async loginUser(twitchId, username, ip_address, login_key, picture_url) {
        try {
            const sql = `
        INSERT INTO users(
            twitch_id,
            username,
            ip_address,
            login_key,
            picture_url
        )
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT(twitch_id) 
        DO UPDATE SET
        twitch_id = EXCLUDED.twitch_id,
            username = EXCLUDED.username,
            ip_address = EXCLUDED.ip_address,
            login_key = EXCLUDED.login_key,
            picture_url = EXCLUDED.picture_url,
            updated_at = NOW()
        RETURNING(SELECT login_key FROM users WHERE twitch_id = $1) AS old_key;
        `;
            const values = [
                twitchId,
                username,
                ip_address,
                login_key,
                picture_url
            ];
            const res = await query(sql, values);
            return res;
        } catch (err) {
            console.error(chalk.red("Fehler beim Login des Users:" + err.message));
        }
    }
}

class DeleteSQL {
    async CustomCommands(valuesArray) {
        try {
            const sql = `WITH deleted_commands AS(
            DELETE FROM custom_commands 
                            WHERE twitch_id = $1 AND category = $2
        )
                        DELETE FROM custom_permissions 
                        WHERE twitch_id = $1 AND category = $2; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Custom Command wurde nicht gelöscht " + error.message))
        };
    }

    async Intervall(valuesArray) {
        try {
            const sql = `DELETE FROM intervall 
                         WHERE twitch_id = $1 AND category = $2; `;
            const res = await query(sql, valuesArray);
            return res.rows;
        } catch (error) {
            console.log(chalk.red("Custom Command wurde nicht gelöscht " + error.message))
        };
    }
}

export const Select = new SelectSQL();
export const Insert = new InsertSQL()
export const Auth = new AuthSQL()
export const Delete = new DeleteSQL()