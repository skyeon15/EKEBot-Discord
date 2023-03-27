const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { discord, voice_nickname } = require('./config.json');
const EKE_DB = require('./modules/eke_db');
const { default: axios } = require('axios');

// 새로운 클라이언트 생성
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	]
});

// 명령어 폴더 불러오기
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// 클라이언트 준비시 첫 실행
client.once('ready', () => {
	console.log('에케봇 준비 완료!');
	client.user.setActivity({
		name: '에케는 에케해',
		type: 'PLAYING'
	})

	// 업타임
	setInterval(function () {
		if (client.user.presence.status === 'online') {
			axios.get(`http://10.15.0.1:3001/api/push/${discord.status}?status=up&msg=OK&ping=`)
		}
	}, 60000); // 60초마다 실행

});

// 명령어 수신
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '명령을 처리하는 중 오류가 발생했어요.', ephemeral: true });
	}
});

// 메시지 수신
client.on('messageCreate', async message => {
	// 봇 여부 확인
	if (message.author.bot) {
		return
	}

	// tts 및 번역 DB 확인
	EKE_DB.message(message)

	// 음성 채널 접속시 닉네임 변경
	for (var v of voice_nickname) {
		if (v.id != message.author.id) {
			continue
		}

		if (message.member.voice.channelId == null) {
			(await message.guild.members.fetch(message.author)).setNickname(v.off)
		} else {
			(await message.guild.members.fetch(message.author)).setNickname(v.on)
		}
	}
})

client.on('voiceStateUpdate', (oldState, newState) => {
	try {
		// 음성 채널에 봇 혼자 있으면
		if (oldState.channel != null && oldState.channel.members.size === 1) {
			// 봇 연결 해제
			getVoiceConnection(oldState.guild.id).destroy()
		}
	} catch (error) {
		console.log(error)
	}
})

// 토큰 로그인
client.login(discord.token)