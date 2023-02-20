const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { discord } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(JSON.parse(JSON.stringify(command.data)));
}

const rest = new REST({ version: '9' }).setToken(discord.token);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(discord.clientId), {
            body: commands
        })
        console.log("전역 명령어 등록 성공.")
    } catch (error) {
        console.log(error)
    }
})()