const { SlashCommandBuilder } = require('@discordjs/builders');
var TTS = require('../modules/TTS')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('말')
        .setDescription('문장을 입력하면 대신 말해줘요.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('말할 말을 입력하세요.')
                .setRequired(true)
        ),
    async execute(interaction) {
        TTS.command(interaction)
    },
};