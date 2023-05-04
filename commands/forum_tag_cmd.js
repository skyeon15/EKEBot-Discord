const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('포럼태그')
        .setDescription('포럼 게시글에 적용된 태그를 가져와요.')
        .addStringOption(option =>
            option.setName('forum_id')
                .setDescription('포럼 ID를 입력해요.')
                .setRequired(true)),
    async execute(interaction) {
        client.channels.fetch(interaction.options.getString('forum_id'))
            .then((channel) => {
                return interaction.reply({
                    content: channel.name + '에서 사용되는 태그에요!\n```json\n' + JSON.stringify(channel.availableTags, null, 2) + '\n```',
                    ephemeral: true
                })
            }).catch((error) => {
                console.log(error.message)
                return interaction.reply({
                    content: '포럼을 못 찾겠어요ㅠㅠ',
                    ephemeral: true
                })
            })
    }
}