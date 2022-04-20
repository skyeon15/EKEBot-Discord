const { createAudioResource, joinVoiceChannel } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const fs = require('node:fs');

module.exports = {
    async execute(message) {
        const buffer = await tts.synthesize({
            text: message.content,
            voice: 'ko',
            slow: false
        })

        fs.writeFileSync('tts.mp3', buffer);

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        const resource = createAudioResource('tts.mp3');
        player.play(resource);

        connection.subscribe(player);
    }
};