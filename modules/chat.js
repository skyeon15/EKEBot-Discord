const { api, chat } = require('../config.json');
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
            console.log(error?.stack)
            interaction.followUp({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    },
    async interaction_image(interaction) {
        try {
            await interaction.deferReply() // 답변 대기

            const tran = await translate.translate(interaction.options.getString('message'), 'ko', 'en', res => {
                return res
            })

            img = await GetImange(tran)
            
            if(/^(http|https):\/\/[^\s$.?#].[^\s]*$/i.test(img)){
                const Embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${interaction.options.getString('message')} 그려봤어요!`)
                .setImage(img)
                .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' })
                await interaction.editReply({ embeds: [Embed] });
            }else{
                interaction.editReply(await translate.translate(img.error.message, 'en', 'ko'))
            }

        } catch (error) {
            console.log(error?.stack)
            if(error.message == "Timeout"){
                interaction.followUp({ content: 'AI가 바쁘대요!', ephemeral: true }) // 새로운 응답 전송
            }else{
                interaction.followUp({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
            }
        }
    },
    async message(message) {
        // .으로 시작하지 않으면 반환
        if (!message.content.startsWith('.')) {
            return
        } else {
            message.content = message.content.substring(1)
        }

        try {
            await message.reply(await GetMessage(message.content)) // 답변 전송
        } catch (error) {
            console.log(error?.stack)
        }
    }
}

async function GetImange(message) {
    if (message === '') {
        return false
    }

    const resPromise = openai.createImage({
        prompt: message,
        n: 1,
        size: "512x512",
    }).then(res => {
        return res.data.data[0].url;
    }).catch(error => {
        return error.response.data;
    });

    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout'))
        }, 10000)
    });

    const result = await Promise.race([resPromise, timeoutPromise]);
    return result;
}

async function GetMessage(message) {
    if (message.substring(1) === '') {
        return
    }

    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: chat.system },
        { role: "assistant", content: chat.assistant },
        { role: "user", content: message }]
    }).then(res => {
        return res.data.choices[0].message.content
    }).catch(error => {
        console.log(error.response)
    })

    return res
}