const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const EKE_DB = require('../modules/eke_db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('에케채널')
        .setDescription('TTS, 번역 등 채널을 설정해요.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tts')
                .setDescription('TTS 설정을 변경해요.')
                .addStringOption(option =>
                    option.setName('사용여부')
                        .setDescription('TTS 상태를 설정해요.')
                        .setRequired(true)
                        .addChoices([
                            ['켜기', 'true'],
                            ['끄기', 'false']
                        ])))
        .addSubcommand(subcommand =>
            subcommand
                .setName('chat')
                .setDescription('에케봇과 대화할 채널을 설정해요.')
                .addStringOption(option =>
                    option.setName('사용여부')
                        .setDescription('에케봇과 대화 상태를 설정해요.')
                        .setRequired(true)
                        .addChoices([
                            ['켜기', 'true'],
                            ['끄기', 'false']
                        ])))
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('번역 설정을 변경해요. 앞에 온점(.)을 누르고 입력하면 자동으로 변환해줘요.')
                .addStringOption(option =>
                    option.setName('사용여부')
                        .setDescription('번역 상태를 설정해요.')
                        .setRequired(true)
                        .addChoices([
                            ['켜기', 'true'],
                            ['끄기', 'false']
                        ]))
                .addStringOption(option =>
                    option.setName('lang1')
                        .setDescription('첫 번째 언어를 선택하세요.')
                        .addChoices([
                            ['한국어', 'ko'],
                            ['영어', 'en'],
                            ['일본어', 'ja'],
                            ['중국어(간체)', 'zh-CN'],
                            ['중국어(번체)', 'zh-TW'],
                            ['베트남어', 'vi'],
                            ['인도네시아어', 'id'],
                            ['태국어', 'th'],
                            ['독일어', 'de'],
                            ['러시아어', 'ru'],
                            ['스페인어', 'es'],
                            ['이탈리아어', 'it'],
                            ['프랑스어', 'fr']
                        ]))
                .addStringOption(option =>
                    option.setName('lang2')
                        .setDescription('두 번째 언어를 선택하세요.')
                        .addChoices([
                            ['한국어', 'ko'],
                            ['영어', 'en'],
                            ['일본어', 'ja'],
                            ['중국어(간체)', 'zh-CN'],
                            ['중국어(번체)', 'zh-TW'],
                            ['베트남어', 'vi'],
                            ['인도네시아어', 'id'],
                            ['태국어', 'th'],
                            ['독일어', 'de'],
                            ['러시아어', 'ru'],
                            ['스페인어', 'es'],
                            ['이탈리아어', 'it'],
                            ['프랑스어', 'fr']
                        ]))
        )
        .toJSON(),
    async execute(interaction) {
        var body;
        if (interaction.options.getString('lang1') != undefined) {
            body = `설정한 기능 : ${interaction.options.getSubcommand()}\n상태 : ${interaction.options.getString('사용여부')}\n언어1 : ${interaction.options.getString('lang1')}\n언어2 : ${interaction.options.getString('lang2')}`
        } else {
            body = `설정한 기능 : ${interaction.options.getSubcommand()}\n상태 : ${interaction.options.getString('사용여부')}`
        }
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('에케채널')
            .setDescription(body)
            .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

        await interaction.reply({ embeds: [embed] });
        await EKE_DB.setChannel(interaction, interaction.options.getSubcommand(), interaction.options.getString('사용여부'), interaction.options.getString('lang1'), interaction.options.getString('lang2'));
    }
}
