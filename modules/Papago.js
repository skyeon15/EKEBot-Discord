const { default: axios } = require('axios');
const { PAPAGO,PAPAGO2 } = require('../config.json');

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
			message.channel.send(data)
		})
    },

    // 번역
    translate(msg, from, to, callback) {
        axios.post('https://openapi.naver.com/v1/papago/n2mt', {
            source: from,
            target: to,
            text: msg
        }, {
            headers: {
                'X-Naver-Client-Id': PAPAGO,
                'X-Naver-Client-Secret': PAPAGO2
            }
        }).then(function (res) {
            // 번역 결과 반환
            callback(res.data.message.result.translatedText)
        }).catch(function (error) {
            console.log(error)
        })
    }
};