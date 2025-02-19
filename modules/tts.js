const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require("@discordjs/voice");
const tts = require('google-translate-tts');
const stream = require('stream')
const textToSpeech = require('@google-cloud/text-to-speech');
const connections = new Map(); // 모든 음성 채널 연결을 저장할 맵
const players = new Map(); // 모든 음성 채널에 대한 플레이어를 저장할 맵

module.exports = {
    async message(message) {
        // 음성 채널이 없으면 반환
        if (message.member.voice.channelId == null) {
            return
        }

        gcp_textToSpeech(message, message.content)
    },
    async command(interaction) {
        // 음성 채널이 없으면 반환
        if (interaction.member.voice.channelId == null) {
            return interaction.reply({ content: '음성 채널에 들어가계셔야 말을 할 수 있어요!', fetchReply: true })
        }

        if (gcp_textToSpeech(interaction, interaction.options.getString('message'))) {
            interaction.reply({ content: interaction.options.getString('message'), fetchReply: true })
        } else {
            interaction.reply({ content: '삐리릭... 목소리를 잃었어요.', fetchReply: true })
        }
    }
}


async function gcp_textToSpeech(interaction, message) {
    const client = new textToSpeech.TextToSpeechClient(); // Google TTS 클라이언트 초기화

    try {
        // 1. Google Cloud TTS 요청 구성
        const request = {
            input: { text: message }, // 입력 텍스트
            voice: { languageCode: 'ko-KR', ssmlGender: 'NEUTRAL' }, // 음성 언어 및 성별 설정
            audioConfig: { audioEncoding: 'MP3' }, // 오디오 형식 (MP3)
        };

        // 2. Google Cloud TTS 호출 및 응답 받기
        const [response] = await client.synthesizeSpeech(request);
        const buffer = response.audioContent; // 응답에서 생성된 오디오 콘텐츠

        if (!buffer) {
            throw new Error('No audio content returned from TTS API'); // 오디오 콘텐츠가 없는 경우 예외 처리
        }

        // 3. Discord Voice Channel 정보 가져오기
        const channelId = interaction.member.voice.channelId; // 사용자가 연결된 음성 채널 ID
        const guildId = interaction.guildId; // Discord 서버 ID

        // 4. 음성 연결 객체 가져오기 또는 새로 생성
        let connection = connections.get(channelId);
        if (!connection) {
            // 음성 채널에 연결 시도
            connection = joinVoiceChannel({
                channelId, // 음성 채널 ID
                guildId,   // 서버 ID
                adapterCreator: interaction.guild.voiceAdapterCreator, // Discord.js에서 제공하는 어댑터
            });

            // 음성 연결이 성공적으로 이루어졌는지 확인 (최대 5초 대기)
            await entersState(connection, VoiceConnectionStatus.Ready, 5000);

            // 연결 객체를 Map에 저장
            connections.set(channelId, connection);

            // 연결이 끊어졌을 때 처리
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    console.log('Reconnecting...');
                    await entersState(connection, VoiceConnectionStatus.Connecting, 5000); // 다시 연결 시도
                } catch {
                    console.error('Reconnection failed, destroying connection');
                    connection.destroy(); // 실패 시 연결 삭제
                    connections.delete(channelId); // Map에서 제거
                }
            });
        }

        // 5. AudioPlayer 생성 또는 기존 객체 재사용
        let player = players.get(channelId);
        if (player) {
            // 기존 플레이어가 있으면 정지
            player.stop();
        } else {
            // 새 플레이어 생성
            player = createAudioPlayer();
            players.set(channelId, player); // Map에 저장
        }

        // 6. 오디오 스트림 생성 및 리소스 생성
        const rs = stream.Readable.from(buffer); // Google TTS 오디오 데이터를 스트림으로 변환
        const resource = createAudioResource(rs); // 오디오 리소스 생성

        // 7. AudioPlayer에 오디오 재생 시작
        player.play(resource);

        // 8. AudioPlayer와 VoiceConnection 연결
        connection.subscribe(player);

        rs.on('error', (error) => {
            console.error('Error in audio stream:', error);
        });

        // 9. 오디오 재생 상태 처리
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Audio is now playing!'); // 재생 시작 시 로그 출력
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Audio playback finished'); // 재생 완료 시 로그 출력
            rs.destroy(); // 스트림 해제
            players.delete(channelId); // 플레이어 객체 제거
        
        });

        // 9. 오디오 재생 상태 처리
        // player.on(AudioPlayerStatus.Buffering, () => {
        //     console.log('데이타 준비중'); // 재생 시작 시 로그 출력
        //     rs.destroy(); // 스트림 해제
        //     players.delete(channelId); // 플레이어 객체 제거
        // });

        // 9. 오디오 재생 상태 처리
        player.on(AudioPlayerStatus.AutoPaused, () => {
            disconnect(connection)
        });


        // 10. AudioPlayer 에러 처리
        player.on('error', (err) => {
            console.error('Player error:', err); // 플레이어 에러 로그 출력
        });

        return true; // 성공적으로 실행되었음을 반환
    } catch (error) {
        // 11. 예외 처리
        console.error('Error in gcp_textToSpeech:', error); // 에러 로그 출력
        return false; // 실패 반환
    }
}


function disconnect(connection) {
    // 음성 채널 나가기
    connection.disconnect()
    console.log('자동일시정지!'); // 재생이 자동으로 일시정지되었을 때 로그 출력
}


async function old_textToSpeech(interaction, message) {
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

        // 플레이어가 Idle 상태일 때 스트림 해제
        player.on(AudioPlayerStatus.Idle, () => {
            // 스트림과 리소스를 해제합니다.
            resource.playbackDuration = 0; // 스트림 해제
            rs.destroy(); // 스트림 해제
        });

        return true
    } catch (error) {
        console.log(error?.stack)
        return false
    }
}