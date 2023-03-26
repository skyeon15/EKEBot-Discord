const { SlashCommandBuilder } = require('@discordjs/builders');
const minecraft_db = require('../modules/minecraft_db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('마인크래프트')
        .setDescription('서버에 등록된 마인크래프트 서버에 화이트리스트로 등록해요.')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('마인크래프트 닉네임을 입력하세요.')
                .setRequired(true)
        ).addStringOption(option =>
            option.setName('terminal')
                .setDescription('Amethy 터미널 ID를 입력해주세요.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('api')
                .setDescription('와니네 api key를 입력해주세요.')
                .setRequired(false)),
    async execute(interaction) {
        // 터미널과 api를 지정하면
        if (interaction.options.getString('terminal') != null || interaction.options.getString('api') != null) {
            // 관리자 권한 확인
            if(interaction.memberPermissions.has('ADMINISTRATOR')){
                minecraft_db.setup(interaction, interaction.options.getString('terminal'), interaction.options.getString('api'))
            }else{
                interaction.reply({content: '권한이 없어요. 관리자 권한이 있는 사람만 서버를 지정할 수 있어요.', ephemeral: true})
            }
        }else{
            minecraft_db.register(interaction)
        }
    }
};