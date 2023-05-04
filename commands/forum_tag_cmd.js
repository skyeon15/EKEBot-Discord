const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('포럼태그')
        .setDescription('포럼 게시글에 적용된 태그를 가져와요.')
        .addStringOption(option =>
            option.setName('forum_id')
                .setDescription('포럼 ID를 입력해요.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('post_id')
                .setDescription('포럼 포스트 ID를 입력해요.')
                .setRequired(true)),
    async execute(interaction) {
        client.channels.fetch(interaction.options.getString('forum_id'))
            .then((channel) => {
                // 포스트 정보 얻기
                channel.fetch(interaction.options.getString('post_id'))
                    .then((message) => {
                        return interaction.reply({
                            content: '해당 포스트에 적용된 태그에요!\n```json\n' + JSON.stringify(message.availableTags, null, 2) + '\n```',
                            ephemeral: true
                        })                        
                    }).catch((error) => {
                        console.log(error.message)
                        return interaction.reply({
                            content: '포스트를 못 찾겠어요ㅠㅠ',
                            ephemeral: true
                        })
                    }
                    )
            }).catch((error) => {
                console.log(error.message)
                return interaction.reply({
                    content: '채널을 못 찾겠어요ㅠㅠ',
                    ephemeral: true
                })
            })
    }
}