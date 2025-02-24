const { SlashCommandBuilder } = require('@discordjs/builders');
const permissions = require('../modules/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('자폭')
    .setDescription('봇을 재시작합니다.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }) // 답변 대기

    if (!permissions.has(interaction, this.data.name)) {
      await interaction.editReply({ content: '이 명령어를 사용할 권한이 없어요.', ephemeral: true });
      return;
    }

    await interaction.editReply("삐리리릭. 자폭합니다.");
    process.exit(1)
  }
}