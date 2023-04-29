const mariadb = require('mariadb');
const { db } = require('../config.json');

const pool = mariadb.createPool({
    host: db.host,
    user: db.id,
    password: db.pw,
    database: db.database,
    connectTimeout: 5000
})

module.exports = {
    // TTS 및 번역 상태 확인
    async message(message) {
        const channelId = message.channel.id;
        let conn;

        try {
            conn = await pool.getConnection();
            // enabled가 1인 row만 가져옴
            const rows = await conn.query(
                `SELECT enabled FROM channel WHERE channel = ?`,
                [channelId]
            )

            // enabled에 따라 모듈 호출
            rows.forEach((row) => {
                // TTS 모듈 호출
                if (row.enabled.includes('tts')) {
                    this.executeModule('tts', message)
                }
                // 번역 모듈 호출
                if (row.enabled.includes('translate')) {
                    this.executeModule('translate', message)
                }
                // 트윗 채널
                if (row.enabled.includes('tweet')) {
                    this.executeModule('tweet', message)
                }
                // 대화 채널
                if (row.enabled.includes('chat')) {
                    this.executeModule('chat', message)
                }
            })
        } catch (error) {
            console.error(error)
        } finally {
            if (conn) {
                conn.release()
            }
        }
    },

    async executeModule(module, message) {
        if (message.content.startsWith('.')) {
            console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] ${message.author.username}(${message.guild.name}): ${message.content}`)
        }
        await require(`./${module}`).message(message)
    },

    async getTranslationSettings(channelId) {
        let conn;

        try {
            conn = await pool.getConnection()
            const [rows] = await conn.query(`SELECT tran_from, tran_to FROM channel WHERE channel = ?`, [channelId])
            return rows
        } catch (error) {
            console.error(error)
            return null
        } finally {
            if (conn) {
                conn.release()
            }
        }
    },

    async setChannel(interaction, column, status1, from, to) {
        const status = status1 === 'true' ? true : false
        let conn, channelId = interaction.channelId
        await checkChannelExists(interaction.channelId)
        try {
            conn = await pool.getConnection();
            let query, params;
            if (from && to) {
                query = `UPDATE channel SET ${column} = ?, tran_from = ?, tran_to = ?, date = ?, user = ?, guild = ? WHERE channel = ?`
                params = [status, from, to, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId]
            } else if (from) {
                query = `UPDATE channel SET ${column} = ?, tran_from = ?, date = ?, user = ?, guild = ? WHERE channel = ?`
                params = [status, from, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId]
            } else if (to) {
                query = `UPDATE channel SET ${column} = ?, tran_to = ?, date = ?, user = ?, guild = ? WHERE channel = ?`
                params = [status, to, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId]
            } else {
                query = `UPDATE channel SET ${column} = ?, date = ?, user = ?, guild = ? WHERE channel = ?`
                params = [status, new Date().toISOString().slice(0, 19).replace('T', ' '), interaction.user.id, interaction.guildId, channelId]
            }
            await conn.query(query, params);
            // console.log(`${channelId} 채널의 ${column.toUpperCase()} 설정을 변경했어요.`);
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }
}

async function checkChannelExists(channelId) {
    let conn
    try {
        conn = await pool.getConnection()
        const [rows] = await conn.query(`SELECT * FROM channel WHERE channel = ?`, [channelId]);
        if (rows && rows.length > 0) {
            return true
        } else {
            await conn.query(`INSERT INTO channel(channel) VALUES (?)`, [channelId]);
            // console.log('쿼리 추가')
            return false
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            // console.log('채널이 이미 존재합니다.');
            return true
        } else {
            console.error(error)
            return false
        }
    } finally {
        if (conn) {
            conn.release()
        }
    }
}


