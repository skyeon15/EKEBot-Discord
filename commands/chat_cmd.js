const { SlashCommandBuilder } = require('@discordjs/builders');
const Chat = require('../modules/openAi')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('에케야')
    .setDescription('에케봇에게 말을 걸어봐요.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('어떤 것을 물어볼까요?')
        .setRequired(true)
    ),
  async execute(interaction) {
    Chat.interaction(interaction)
  }
}