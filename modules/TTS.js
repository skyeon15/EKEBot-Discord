const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const stream = require('stream')

module.exports = {
    async execute(message) {
        // 음성 채널이 없으면 반환
        if (message.member.voice.channelId == null) {
            return
        }

        try {
            const buffer = await tts.synthesize({
                text: message.content,
                voice: 'ko',
                slow: false
            })

            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.guildId,
                adapterCreator: message.guild.voiceAdapterCreator,
            })

            const player = createAudioPlayer()

            const rs = stream.Readable.from(buffer)

            const resource = createAudioResource(rs)
            player.play(resource)

            connection.subscribe(player)
        } catch (error) {
            return
        }
    },
    async command(interaction) {
        // 음성 채널이 없으면 반환
        if (interaction.member.voice.channelId == null) {
            interaction.reply({ content: '음성 채널에 들어가있어야 말을 할 수 있어요!', fetchReply: true });
            return
        }

        try {
            const buffer = await tts.synthesize({
                text: interaction.options.getString('message'),
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

            interaction.reply({ content: interaction.options.getString('message'), fetchReply: true });
        } catch (error) {
            console.log(error)
            interaction.reply({ content: '삐리릭... 목소리를 잃었어요.', fetchReply: true });
        }
    }
};