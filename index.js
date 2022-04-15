const fs = require('node:fs');
const Discord = require('discord.js')
const { prefix, token, channel, API, API2, APIS, API2S } = require('./config.json');
const { TwitterApi } = require('twitter-api-v2');

// 새로운 클라이언트 생성
const client = new Discord.Client()
client.commands = new Discord.Collection()

// commands 폴더에 있는 명령어 읽음
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

// 클라이언트 준비시 첫 실행
client.on('ready', () => {
	console.log('에케봇 준비 완료!');
});

const userClient = new TwitterApi({
	appKey: API,
	appSecret: APIS,
	accessToken: API2,
	accessSecret: API2S,
}).v2

function tweet(msg){
	userClient.tweet(msg).then(result => {
		console.log(result)
	}).catch(error => {
		console.log(error)
	})
}

client.on("message", (message) => {
	if (message.channel == channel) {
		tweet(message.content)
	}

	if (!message.content.startsWith(prefix) || message.author.bot) {
		return
	}
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift();

	if (!client.commands.has(command)) {
		return
	}

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
	}
});

// 토큰 로그인
client.login(token);