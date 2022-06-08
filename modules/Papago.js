const { default: axios } = require('axios');
const { PAPAGO, PAPAGO2 } = require('../config.json');

var api = [PAPAGO[0], PAPAGO[1]]

module.exports = {
    async execute(message) {
        // .으로 시작하지 않으면 반환
        if (!message.content.startsWith('.')) {
            return
		}

		message.content = message.content.substring(1)

		// 언어 확인
		const ko = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
		var from, to
		if (ko.test(message.content)) {
			from = 'ko'
			to = 'ja'
		} else {
			from = 'ja'
			to = 'ko'
		}

		this.translate(message.content, from, to, function (data) {
			message.reply(data)
		})
    },

    // 번역
    translate(msg, from, to, callback) {
        axios.post('https://openapi.naver.com/v1/papago/n2mt', {
            source: from,
            target: to,
            text: msg.trim().replace(/\n{2,}/g,"\n").replace(/```/g, '\n').replace('md', '')
        }, {
            headers: {
                'X-Naver-Client-Id': api[0],
                'X-Naver-Client-Secret': api[1]
            }
        }).then(function (res) {
            // 번역 결과 반환
            // console.log(res.data.message.result.translatedText)
            callback(res.data.message.result.translatedText)
        }).catch(function (error) {
            console.log(error)

            // API 사용량 초과시 2번째 API 키 사용
            if(error.response.status == '429'){
                api[0] = PAPAGO2[0]
                api[1] = PAPAGO2[1]
                translate(msg, from, to, callback)
            }
        })
    }
};