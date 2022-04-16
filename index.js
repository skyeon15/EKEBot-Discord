const fs = require('node:fs');
const Discord = require('discord.js')
const { prefix, token, channel, API, API2, APIS, API2S, PAPAGO, PAPAGO2 } = require('./config.json');
const { TwitterApi } = require('twitter-api-v2');
var https = require('https');
const { default: axios } = require('axios');

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

// 트위터 클라이언트
const userClient = new TwitterApi({
	appKey: API,
	appSecret: APIS,
	accessToken: API2,
	accessSecret: API2S,
}).v2

// 트윗 업로드
function tweet(msg){
	userClient.tweet(msg).then(result => {
		console.log(result)
	}).catch(error => {
		console.log(error)
	})
}

// 번역
function tran(msg) {
	axios.post('https://openapi.naver.com/v1/papago/n2mt', {
		source: 'en',
		target: 'ko',
		text: msg
	}, {
		headers: {
			'X-Naver-Client-Id': PAPAGO,
			'X-Naver-Client-Secret': PAPAGO2
		}
	}).then(function(res){
		// 번역 결과 트윗 호출
		tweet(res.data.message.result.translatedText)
	}).catch(function(error){
		console.log(error)
	})
}

// 메시지 수신
client.on("message", (message) => {
	// 채널 ID 확인
	if (message.channel == channel) {
		tran(message.content)
	}

	// 접두사, 봇 확인
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return
	}
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift();

	// 없는 명령어면
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