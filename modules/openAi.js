const { api } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const translate = require('./translate')
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    organization: api.openaiOrganization,
    apiKey: api.openaiApi,
});
const openai = new OpenAIApi(configuration);

module.exports = {
    async interaction(interaction) {
        try {
            await interaction.deferReply() // 답변 대기

            await interaction.editReply(await GetMessage(interaction.options.getString('message'))) // 답변 전송
        } catch (error) {
            console.log(error)
            interaction.followUp({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    },
    async interaction_image(interaction) {
        try {
            await interaction.deferReply() // 답변 대기

            const tran = await translate.translate(interaction.options.getString('message'), 'ko', 'en', res => {
                return res
            })

            const timeout = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms, '타임아웃'));
            }

            const imange = await Promise.race([GetImange(tran), timeout(10000)]);
            if (imange === '타임아웃' || imange == null) {
                return interaction.followUp({ content: 'AI가 바쁘대요!', ephemeral: true })
            }

            const Embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${interaction.options.getString('message')} 그려봤어요!`)
                .setImage(imange)
                .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' })

            await interaction.editReply({ embeds: [Embed] });
        } catch (error) {
            console.log(error)
            interaction.followUp({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    },
    async message(message) {
        if (!message.content.startsWith('.')) {
            return
        }

        try {
            await message.reply(await GetMessage(message.content)) // 답변 전송
        } catch (error) {
            console.log(error)
            message.reply({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    }
}

async function GetImange(message) {
    const res = openai.createImage({
        prompt: message,
        n: 1,
        size: "512x512",
    }).then(res => {
        return res.data.data[0].url
    }).catch(error => {
        console.log(error.response.data)
    })

    return res
}

async function GetMessage(message) {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "My name is 에케봇, and your answer should be a short sentence in Korean, with a friendly agent tone." },
        { role: "assistant", content: "The one who made me is 에케. belong to the 파란대나무숲." },
        { role: "user", content: message }]
        // 너의 이름은 에케봇이야. 답변은 한글로 짧게 한 문장으로 해야해. 친절한 상담원 말투로 대답해줘.
    }).then(res => {
        return res.data.choices[0].message.content
    }).catch(error => {
        console.log(error.response)
    })

    return res
}