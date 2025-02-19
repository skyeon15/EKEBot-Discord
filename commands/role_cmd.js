const { SlashCommandBuilder } = require('@discordjs/builders');
const { scheduleJob } = require('node-schedule');
const client = require('../client');
const _ = require('lodash');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('역할')
    .setDescription('역할이 할당된 멤버를 확인해요.')
    .addStringOption(option =>
      option.setName('mentions')
        .setDescription('멘션할 사용자 또는 역할을 언급해주세요. 예: @파란판다 @에케')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }) // 답변 대기

    const hasRole = interaction.member.roles.cache.has('1188429953096744960');

    if (!hasRole) {
      // 사용자가 필요한 역할을 가지고 있지 않은 경우
      await interaction.editReply({ content: '이 명령어를 사용할 권한이 없습니다.', ephemeral: true });
      return; // 명령어 실행을 여기서 중단
    }

    const mentionsString = interaction.options.getString('mentions');

    // 멘션 문자열에서 사용자와 역할 ID 추출
    const userMentions = mentionsString.match(/<@!?(\d+)>/g) || [];
    const roleMentions = mentionsString.match(/<@&(\d+)>/g) || [];
    const userIds = new Set(userMentions.map(mention => mention.replace(/<@!?(\d+)>/, '$1')));

    // 역할에 속한 사용자 ID 추출
    for (const roleMention of roleMentions) {
      const roleId = roleMention.replace(/<@&(\d+)>/, '$1');
      const role = await interaction.guild.roles.fetch(roleId).catch(console.error);
      if (role) {
        const members = await role.members.fetch({ limit: 1000 });
        members.forEach(member => userIds.add(member.id));
      }
    }

    //await interaction.editReply({ content: Array.from(userIds).join(",").slice(0, -2), ephemeral: true });

    _.throttle(() => {
      userIds.forEach(userId => {
        const user = client.users.fetch(userId);
        console.log(user);
      });

      console.log(_.size(userIds))
    }, 1000)()
  }
}