const mariadb = require('mariadb');
const { db } = require('../config.json');
const { default: axios } = require('axios');

const pool = mariadb.createPool({
    host: db.host,
    user: db.id,
    password: db.pw,
    database: db.database
})

pool.on('error', (error) => {
    console.log(error?.stack)
})

module.exports = {
    async setup(interaction, terminal, api_key) {
        insertOrUpdateValues(interaction.guildId, interaction.user.id, new Date().toISOString().slice(0, 19).replace('T', ' '), terminal, api_key)
            .then(res => {
                interaction.reply('성공적으로 설정되었습니다.')
            }).catch(error => {
                console.log(error?.stack)
            })
    },
    async register(interaction) {
        getServer(interaction)
    }
}

async function insertOrUpdateValues(guild, user, date, terminal, api_key) {

    let conn;
    try {
        conn = await pool.getConnection()

        await conn.query(
            'INSERT INTO minecraft (guild, user, date, terminal, api_key) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE guild = ?, user = ?, date = ?, terminal = ?, api_key = ?',
            [guild, user, date, terminal, api_key, guild, user, date, terminal, api_key]
        );
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

async function getServer(interaction) {
    let conn, nickname;
    try {
        conn = await pool.getConnection()

        const rows = await conn.query(
            'SELECT terminal, api_key FROM minecraft WHERE guild = ?',
            [interaction.guildId]
        )

        const { terminal, api_key } = rows[0]

        nickname = interaction.options.getString('nickname')

        const headers = {
            'Content-Type': 'application/json',
            'o': api_key,
        }

        // 닉네임 유효성 확인
        await axios.get('https://api.mojang.com/users/profiles/minecraft/' + nickname)
            .then(response => {
                // if (response.data.id) {
                //     console.log(response.data.name)
                // }
            }).catch((error) => {
                throw new Error('닉네임오류')
            })

        // 와니 터미널 API 통신
        await axios.post(`https://api.wany.io/amethy/terminal/nodes/${terminal}/command`, { command: 'whitelist add ' + nickname }, { headers })
            .then(response => {
                if (response.data.message == "OK") {
                    interaction.reply(nickname + '님을 화이트리스트에 등록했어요!')
                } else {
                    interaction.reply('마인크래프트 서버가 응답하지 않아요.')
                }
            })
            .catch(error => {
                console.log(error.response)
            })
    } catch (error) {
        if(error.message == '닉네임오류'){
            interaction.reply(nickname + '은 마인크래프트에 등록되지 않은 닉네임이에요!')
        }else{
            interaction.reply('디스코드 서버에 등록된 마인크래프트 서버가 없어요.')
        }
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}
