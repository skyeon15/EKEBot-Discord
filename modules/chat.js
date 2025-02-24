const { api, chat } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const translate = require('./translate')
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: api.openaiApi,
});

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
                // interaction.editReply(interaction.options.getString('message'))
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

        // 해당 채널의 최근 5개 메시지 및 발화자 출력 (순서대대로)
        const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
        const messagesArray = Array.from(fetchedMessages.values()).reverse();
        let messagesString = messagesArray.map(msg => {
            const nickname = msg.member ? msg.member.nickname : null;
            return `${nickname || msg.author.username}: ${msg.content}`;
        }).join('\n');
        messagesString += `\n${message.member.nickname || message.author.username}: ${message.content}`;

        // 자신의 닉네임 가져오기
        const botMember = message.guild.members.cache.get(message.client.user.id);
        const botNickname = botMember ? botMember.nickname || botMember.user.username : '에케봇';

        messagesString += `\n${botNickname}: `;

        try {
            await message.reply(await GetMessage(messagesString, botNickname)) // 답변 전송
        } catch (error) {
            console.log(error?.stack)
        }
    }
}

async function GetImange(message) {
    if (message === '') {
        return false
    }
    const resPromise = openai.images.createVariation({
        prompt: message,
        n: 1,
        size: "512x512",
    }).then(res => {
        console.log(res.data)
        return res.data.data[0].url;
    }).catch(error => {
        return error.response;
    });

    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Timeout'))
        }, 10000)
    });

    const result = await Promise.race([resPromise, timeoutPromise]);
    return result;
}

async function GetMessage(message, botNickname) {
    if (message.substring(1) === '') {
        return
    }

    if (botNickname) {
        return await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: chat.system },
                { role: "assistant", content: chat.assistant + `다음 문장에 빈칸에 어울릴만한 문장을 대답해봐.` },
                { role: "user", content: message }
            ]
        }).then(res => {
            return res.choices[0].message.content.replace(`${botNickname}: `, '')
        }).catch(error => {
            console.log(error.response)
        })
    } else {
        return await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: chat.system },
                { role: "assistant", content: chat.assistant },
                { role: "user", content: message }
            ]
        }).then(res => {
            return res.choices[0].message.content
        }).catch(error => {
            console.log(error.response)
        })
    }
}