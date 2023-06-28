const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const stream = require('stream')

module.exports = {
    async message(message) {
        // 음성 채널이 없으면 반환
        if (message.member.voice.channelId == null) {
            return
        }

        textToSpeech(message, message.content)
    },
    async command(interaction) {
        // 음성 채널이 없으면 반환
        if (interaction.member.voice.channelId == null) {
            return interaction.reply({ content: '음성 채널에 들어가계셔야 말을 할 수 있어요!', fetchReply: true })
        }

        if (textToSpeech(interaction, interaction.options.getString('message'))) {
            interaction.reply({ content: interaction.options.getString('message'), fetchReply: true })
        } else {
            interaction.reply({ content: '삐리릭... 목소리를 잃었어요.', fetchReply: true })
        }
    }
}

async function textToSpeech(interaction, message) {
    // 음성 채널이 없으면 반환
    try {
        const buffer = await tts.synthesize({
            text: message,
            voice: 'ko',
            slow: false
        })

        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })

        const player = createAudioPlayer()

        const rs = stream.Readable.from(buffer)

        const resource = createAudioResource(rs)
        player.play(resource)

        connection.subscribe(player)

        return true
    } catch (error) {
        console.log(error?.stack)
        return false
    }
}