const discordTTS = require("discord-tts");
const { AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const voice = tts.voices.findByCode('ko-KR');
const fs = require('node:fs');

module.exports = {
    async execute(message) {
        const buffer = await tts.synthesize({
            text: message.content,
            voice: 'ko',
            slow: false // optional
        })

        fs.writeFileSync('tts.mp3', buffer);

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const { createAudioPlayer } = require('@discordjs/voice');

        const player = createAudioPlayer();

        const resource = createAudioResource('tts.mp3');
        player.play(resource);

        connection.subscribe(player);

        // try {
        //     let voiceConnection;
        //     let audioPlayer = new AudioPlayer();

        //     const stream = discordTTS.getVoiceStream(message.content, { lang: 'ko' });
        //     const audioResource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
        //     if (!voiceConnection || voiceConnection?.status === VoiceConnectionStatus.Disconnected) {
        //         voiceConnection = joinVoiceChannel({
        //             channelId: message.member.voice.channelId,
        //             guildId: message.guildId,
        //             adapterCreator: message.guild.voiceAdapterCreator,
        //         });
        //         voiceConnection = await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
        //     }

        //     if (voiceConnection.status === VoiceConnectionStatus.Connected) {
        //         voiceConnection.subscribe(audioPlayer);
        //         audioPlayer.play(audioResource);
        //     }
        // } catch (error) {
        //     return
        // }
    }
};