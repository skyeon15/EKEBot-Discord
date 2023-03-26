const { SlashCommandBuilder } = require('@discordjs/builders');
const Chat = require('../modules/openAi')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('그림')
    .setDescription('에케봇이 그림을 그래드려요.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('어떤 걸 그려볼까요?')
        .setRequired(true)
    ),
  async execute(interaction) {
    Chat.interaction_image(interaction)
  }
}