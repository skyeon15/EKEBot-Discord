const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, channel_Papago, channel_Tweet, channel_TTS, channel_WLTTS, channel_WLTTS_ID, voice_nickname } = require('./config.json');

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
});

// 메시지 수신
client.on('messageCreate', async message => {
	// 트윗 채널 - 피드백 없으므로 봇 확인 X
	if (channel_Tweet.includes(message.channel.id)) {
		require('./modules/Tweet').execute(message)
	}

	// 봇 여부 확인
	if (message.author.bot) {
		return
	}

	// 파파고 채널
	if (channel_Papago.includes(message.channel.id)) {
		require('./modules/Papago').execute(message)
	}

	// TTS 채널
	if (channel_TTS.includes(message.channel.id)) {
		require('./modules/TTS').execute(message)
	}

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

	// WLTTS 채널
	if (channel_WLTTS.includes(message.channel.id)) {
		if (channel_WLTTS_ID.includes(message.author.id)) {
			require('./modules/TTS').execute(message)
		}
	}
})

// 명령어 수신
client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '명령에 오류가 있어요.', ephemeral: true });
	}
});

// 토큰 로그인
client.login(token);