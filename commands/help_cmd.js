const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('도움말')
        .setDescription('에케봇 명령어와 사용방법을 알려줘요.'),
    async execute(interaction) {
        const Embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('에케봇 도움말')
            .setDescription('명령어를 알려드릴게요.\n<부등호는 필수> [대괄호는 선택] 옵션을 의미해요.\n/를 누르고 명령어를 입력해도 설명을 볼 수 있어요.')
            .addFields(
                { name: '봇 정보\n\n도움말', value: '에케봇 명령어와 사용방법을 알려줘요.' },
                { name: '핑', value: '봇 지연시간을 확인해요.' },
                { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                { name: '접근성 기능\n\n말 <할말>', value: '문장을 입력하면 대신 말해줘요. (TTS)' },
                { name: '번역 <출발언어> <도착언어> <내용>', value: '입력한 문장을 번역해줘요.' },
                { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                { name: '정보 제공\n\n시세 <금/기름/코인> [코인심볼]', value: '각종 시세를 알려줘요.' },
                { name: '급식 <학교이름>', value: '학교 급식을 알려줘요.' },
                { name: '코로나', value: '대한민국 코로나19 상황을 알려줘요.' },
                { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                { name: '게임 관련 기능\n\n마인크래프트 <닉네임> [터미널] [API]', value: '마인크래프트 화이트리스트를 등록해요.\n터미널과 API를 입력하면 서버에 마인크래프트 서버를 등록해요.' },
                { name: '로스트아크 <닉네임>', value: '로스트아크 캐릭터 정보를 알아봐요.' },
                { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                { name: 'AI 기능\n\n에케야 <할말>', value: '에케봇이랑 대화해요.' },
                { name: '그림 <단어>', value: '단어에 대한 그림을 그려줘요.' },
                { name: '[유료] 에케채널 <tts/translate/chat> <켜기/끄기> [기타설정]', value: '에케봇 전용 채널을 설정해요.' })
            .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

        interaction.reply({ embeds: [Embed] });
    },
};