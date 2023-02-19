const mariadb = require('mariadb');
const { db_host, db_id, db_pw, database } = require('../config.json');

const pool = mariadb.createPool({
    host: db_host,
    user: db_id,
    password: db_pw,
    database: database
});

module.exports = {
    // TTS 및 번역 상태 확인
    async message(message) {
        const channelId = message.channel.id;
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(
                `SELECT * FROM channel WHERE channel = ? AND (tts = 1 OR translate = 1)`,
                [channelId]
            );
            rows.forEach((row) => {
                if (row.tts) {
                    console.log(`Channel ${row.channel} TTS is enabled`);
                    require('../modules/TTS').execute(message);
                }
                if (row.translate) {
                    console.log(`Channel ${row.channel} translation is enabled`);
                    require('../modules/Papago').execute(message);
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },

    async setChannel(interaction, column, status1, from, to) {
        const status = status1 === 'true' ? true : false;
        let conn, channelId = interaction.channelId;
        await checkChannelExists(interaction.channelId);
        try {
            conn = await pool.getConnection();
            let query, params;
            if (from && to) {
                query = `UPDATE channel SET ${column} = ?, tran_from = ?, tran_to = ?, date = ?, user = ?, guild = ? WHERE channel = ?`;
                params = [status, from, to, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId];
            } else if (from) {
                query = `UPDATE channel SET ${column} = ?, tran_from = ?, date = ?, user = ?, guild = ? WHERE channel = ?`;
                params = [status, from, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId];
            } else if (to) {
                query = `UPDATE channel SET ${column} = ?, tran_to = ?, date = ?, user = ?, guild = ? WHERE channel = ?`;
                params = [status, to, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId];
            } else {
                query = `UPDATE channel SET ${column} = ?, date = ?, user = ?, guild = ? WHERE channel = ?`;
                params = [status, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId];
            }
            await conn.query(query, params);
            console.log(`${column.toUpperCase()} has been enabled in channel ${channelId}`);
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },
}

async function checkChannelExists(channelId) {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query(`SELECT * FROM channel WHERE channel = ?`, [channelId]);
        if (rows.length > 0) {
            return true;
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (conn) {
            conn.release();
        }
    }

    // 쿼리 실행이 실패했을 경우
    try {
        conn = await pool.getConnection();
        await conn.query(`INSERT INTO channel(channel) VALUES (?)`, [channelId]);
        console.log('쿼리 추가')
        return false;
    } catch (error) {
        console.error(error);
        return false;
    } finally {
        if (conn) {
            conn.release();
        }
    }
}
