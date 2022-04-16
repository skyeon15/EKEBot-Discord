const Discord = require('discord.js')
const { token, channel, API, API2, APIS, API2S, PAPAGO, PAPAGO2 } = require('./config.json');
const { TwitterApi } = require('twitter-api-v2');
const { default: axios } = require('axios');
var twitter = require('twitter-text')

// 새로운 클라이언트 생성
const client = new Discord.Client()

// 클라이언트 준비시 첫 실행
client.on('ready', () => {
	console.log('에케봇 준비 완료!');
});

// 트위터 클라이언트
const twitterClient = new TwitterApi({
	appKey: API,
	appSecret: APIS,
	accessToken: API2,
	accessSecret: API2S,
}).v2

// 글자 자르기
function splitByte(str) {
	// 번역된 글자수
	var total = twitter.parseTweet(str).weightedLength
	// 268 바이트 넘어가면
	if (total > 268) {
		// 글자 배열 생성
		arr = []
		for (let i = 0; i < (total / 268); i++) {
			// 글자수 분할
			var cut = cutByte(str)
			// 분할한 글자 배열에 추가
			arr.push(cut + '\n#VRChat테스트')
			// 분할한 글자 삭제
			str = str.replace(cut, '')
		}
		// 스레드 게시
		twitterClient.tweetThread(arr).then(result => {
			console.log(result)
		}).catch(error => {
			console.log(error)
		})
	}else{
		// 트윗 게시
		twitterClient.tweet(str + '\n#VRChat테스트').then(result => {
			console.log(result)
		}).catch(error => {
			console.log(error)
		})
	}
}

// 글자 바이트 단위로 자르기
function cutByte(str) {
	for(b=i=0;c=str.charCodeAt(i);) {
      b+=c>>7?2:1;
      if (b > 268)
      break;
      i++;
    }
  	return str.substring(0,i);
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
		splitByte(res.data.message.result.translatedText)
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

	if (message.content == "핑") {
		message.channel.send(`퐁!`)
	}
});

// 토큰 로그인
client.login(token);