const { SlashCommandBuilder } = require('@discordjs/builders');
const translate = require('../modules/translate')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('번역')
        .setDescription('입력한 문장을 번역해줘요.')
        .addStringOption(option =>
            option.setName('from')
                .setDescription('번역할 원본 언어를 선택하세요.')
                .addChoices([['한국어', 'ko'], ['영어', 'en'], ['일본어', 'ja'], ['중국어 간체', 'zh-CN'], ['중국어 번체', 'zh-TW'], ['베트남어', 'vi'], ['인도네시아어', 'id'], ['태국어', 'th'], ['독일어', 'de'], ['러시아어', 'ru'], ['스페인어', 'es'], ['이탈리아어', 'it'], ['프랑스어', 'fr']])
                .setRequired(true))
        .addStringOption(option =>
            option.setName('to')
                .setDescription('번역 결과 언어를 선택하세요.')
                .addChoices([['한국어', 'ko'], ['영어', 'en'], ['일본어', 'ja'], ['중국어 간체', 'zh-CN'], ['중국어 번체', 'zh-TW'], ['베트남어', 'vi'], ['인도네시아어', 'id'], ['태국어', 'th'], ['독일어', 'de'], ['러시아어', 'ru'], ['스페인어', 'es'], ['이탈리아어', 'it'], ['프랑스어', 'fr']])
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('번역할 메시지를 입력하세요.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // 번역할 언어가 같으면
        if(interaction.options.getString('from') == interaction.options.getString('to')){
            interaction.reply({ content: '입력한 언어와 번역할 언어가 같아요.', fetchReply: true });
        }else{
            translate.interaction(interaction)
        }
    },
};