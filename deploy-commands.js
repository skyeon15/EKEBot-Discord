const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands
        })
        console.log(`${guildId} 명령어 등록 성공.`)
    } catch (error) {
        console.log(error)
    }

    try {
        await rest.put(Routes.applicationCommands(clientId), {
            body: {}
        })
        console.log("전역 명령어 등록 성공.")
    } catch (error) {
        console.log(error)
    }
})()