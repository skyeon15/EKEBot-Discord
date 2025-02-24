const { default: axios } = require('axios');
const { api } = require('../config.json');
const EKE_DB = require('./eke_db');

let api_lc = [api.PAPAGO[0], api.PAPAGO[1]]

module.exports = {
    async message(message) {
        // .으로 시작하지 않으면 반환
        if (!message.content.startsWith('.') && message.content.substring(1) === '') {
            return
        }else{
            message.content = message.content.substring(1)
        }

        // DB 설정 확인
        const rows = await EKE_DB.getTranslationSettings(message.channel.id);
        let from = rows?.tran_from || 'ko';
        let to = rows?.tran_to || 'en';

        try {
            if (from != await checkLang(message.content)) {
                message.reply(await translateGoogle(message.content, to, from))
            } else {
                message.reply(await translateGoogle(message.content, from, to))
            }
        } catch (error) {
            console.log(error?.stack)
            await message.reply('번역 중 오류가 발생했어요.')
        }
    },
    async interaction(interaction) {
        try {
            await interaction.reply(await translateGoogle(interaction.options.getString('message'), interaction.options.getString('from'), interaction.options.getString('to')))
        } catch (error) {
            console.log(error?.stack)
            interaction.reply({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true })
        }
    },
    async translate(msg, from, to) {
        return translateGoogle(msg, from, to)
    }
}

async function translateGoogle(msg, from, to) {
    const { translate } = await import('@vitalets/google-translate-api');

    const res = await translate(msg, { from: from, to: to });
    return res.text
}

async function checkLang(msg) {
    const res = await axios.post('https://openapi.naver.com/v1/papago/detectLangs', {
        query: msg.trim().replace(/\n{2,}/g, "\n").replace(/```/g, '\n').replace('md', '')
    }, {
        headers: {
            'X-Naver-Client-Id': api_lc[0],
            'X-Naver-Client-Secret': api_lc[1]
        }
    }).then(res => {
        return res.data.langCode
    }).catch(error => {
        console.log(error.response.data)

        // API 사용량 초과시 2번째 API 키 사용
        if (error.response.status == '429') {
            api[0] = api.PAPAGO2[0]
            api[1] = api.PAPAGO2[1]
            checkLang(msg)
        }
    })

    return res
}