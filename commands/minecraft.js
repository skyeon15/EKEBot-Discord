const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('마인크래프트')
        .setDescription('서버에 등록된 마인크래프트 서버에 화이트리스트로 등록해요.')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('마인크래프트 닉네임을 입력하세요.')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (interaction.guildId == '1087703690070208553') {
            axios.get('http://10.15.0.1:4567/whitelist?name=' + interaction.options.getString('nickname'))
                .then(function (res) {
                    interaction.reply(res.data);
                })
                .catch(function (error) {
                    console.log(error)
                })
        }else{
            interaction.reply('허용되지 않은 서버입니다.')
        }
    }
};