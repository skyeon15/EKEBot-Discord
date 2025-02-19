const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('자폭')
    .setDescription('봇을 재시작합니다.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }) // 답변 대기

    const hasRole = interaction.member.roles.cache.has('1188429953096744960');

    if (!hasRole) {
      // 사용자가 필요한 역할을 가지고 있지 않은 경우
      await interaction.editReply({ content: '이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
      return; // 명령어 실행을 여기서 중단
    }

    await interaction.editReply("삐리리릭. 자폭합니다.");
    process.exit(1)
  }
}