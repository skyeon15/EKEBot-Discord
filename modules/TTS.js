const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const stream = require('stream')

module.exports = {
    async execute(message) {
        // 음성 채널이 없으면 반환
        if(message.member.voice.channelId == null){
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

            const rs=stream.Readable.from(buffer)

            const resource = createAudioResource(rs)
            player.play(resource)

            connection.subscribe(player)
        } catch (error) {
            return
        }
    }
};