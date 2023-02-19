const { SlashCommandBuilder } = require('@discordjs/builders');
const MariaDB = require('../modules/MariaDB')

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
                        .addChoice('켜기', 'true')
                        .addChoice('끄기', 'false')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('번역 설정을 변경해요. 앞에 온점(.)을 누르고 입력하면 자동으로 변환해줘요.')
                .addStringOption(option =>
                    option.setName('사용여부')
                        .setDescription('번역 상태를 설정해요.')
                        .setRequired(true)
                        .addChoice('켜기', 'true')
                        .addChoice('끄기', 'false'))
                .addStringOption(option =>
                    option.setName('from')
                        .setDescription('번역 전 언어를 선택하세요.')
                        .addChoice('한국어', 'ko')
                        .addChoice('영어', 'en')
                        .addChoice('일본어', 'ja')
                        .addChoice('중국어(간체)', 'zh-CN')
                        .addChoice('중국어(번체)', 'zh-TW')
                        .addChoice('베트남어', 'vi')
                        .addChoice('인도네시아어', 'id')
                        .addChoice('태국어', 'th')
                        .addChoice('독일어', 'de')
                        .addChoice('러시아어', 'ru')
                        .addChoice('스페인어', 'es')
                        .addChoice('이탈리아어', 'it')
                        .addChoice('프랑스어', 'fr'))
                .addStringOption(option =>
                    option.setName('to')
                        .setDescription('번역 후 언어를 선택하세요.')
                        .addChoice('한국어', 'ko')
                        .addChoice('영어', 'en')
                        .addChoice('일본어', 'ja')
                        .addChoice('중국어(간체)', 'zh-CN')
                        .addChoice('중국어(번체)', 'zh-TW')
                        .addChoice('베트남어', 'vi')
                        .addChoice('인도네시아어', 'id')
                        .addChoice('태국어', 'th')
                        .addChoice('독일어', 'de')
                        .addChoice('러시아어', 'ru')
                        .addChoice('스페인어', 'es')
                        .addChoice('이탈리아어', 'it')
                        .addChoice('프랑스어', 'fr'))
        )
        .toJSON(),
    async execute(interaction) {
        await interaction.reply(`설정한 상태 : ${interaction.options.getSubcommand()}`);
        await MariaDB.setChannel(interaction, interaction.options.getSubcommand(), interaction.options.getString('사용여부'), interaction.options.getString('from'), interaction.options.getString('to'));
    }
}
