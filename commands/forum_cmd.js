const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('포럼')
        .setDescription('포럼 관련 기능이에요.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('동작을 선택해요.')
                .setRequired(true)
                .addChoices([
                    ['태그', 'tag']
                ]))
        .addStringOption(option =>
            option.setName('forum_id')
                .setDescription('포럼 ID를 입력해요.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }) // 답변 대기

        const action = interaction.options.getString('action');

        //interaction에서 forum_id 옵션 값을 가져와 해당 채널을 찾기
        const forum = await client.channels.fetch(interaction.options.getString('forum_id'))
            .catch((error) => {
                console.log(error.stack)
                return interaction.editReply('포럼을 못 찾겠어요ㅠㅠ')
            })

        switch (action) {
            case 'tag':
                // 태그 동작시
                return interaction.editReply(forum.name + '에서 사용되는 태그에요!\n```json\n' + JSON.stringify(forum.availableTags, null, 2) + '```')
            default:
                break;
        }
    }
}