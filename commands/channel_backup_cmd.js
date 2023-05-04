const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const client = require('../client')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('채널백업')
        .setDescription('채널을 백업하거나 복원해요.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('실행할 작업을 선택해요.')
                .setRequired(true)
                .addChoice('백업', 'backup')
                .addChoice('포럼복원', 'forum_restore')
                .addChoice('복원', 'restore'))
        .addStringOption(option =>
            option.setName('channel_id')
                .setDescription('채널 ID를 입력해요.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('json_url')
                .setDescription('JSON URL을 입력해요.')
                .setRequired(false)),
    async execute(interaction) {
        // 관리자 권한 확인
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: '관리자 권한이 있는 사람만 사용할 수 있어요.',
                ephemeral: true
            })
        }
        
        await interaction.deferReply() // 답변 대기

        const action = interaction.options.getString('action');
        var channel = interaction.options.getString('channel_id')

        try {
            if (channel == undefined) {
                // 채널 ID가 비어있으면
                channel = interaction.channel
            } else {
                // 채널 ID로 채널 찾기
                channel = await client.channels.fetch(channel)
                    .then((channel) => {
                        return channel
                    }).catch((error) => {
                        console.log(error.message)
                        interaction.editReply({
                            content: '존재하지 않는 채널이에요.',
                            ephemeral: true,
                        });
                        throw new Error('채널 없음')
                    })
            }

            switch (action) {
                case 'backup':
                    // 모든 메시지 가져오기
                    fetchAllMessages(channel)
                        .then((messages) => {
                            const messagesJson = messages.map((message) => {
                                // 첨부 파일 처리
                                const attachments = message.attachments.map((attachment) => {
                                    return {
                                        id: attachment.id,
                                        url: attachment.url,
                                    };
                                });

                                return {
                                    id: message.id,
                                    content: message.content,
                                    author: {
                                        id: message.author.id,
                                        username: message.author.username + '#' + message.author.discriminator,
                                    },
                                    timestamp: message.createdTimestamp,
                                    attachments: attachments, // 첨부 파일 정보 추가
                                };
                            });
                            const jsonString = JSON.stringify(messagesJson, null, 2);
                            const buffer = Buffer.from(jsonString, 'utf-8');
                            const attachment = new MessageAttachment(buffer, 'backup_data.json');

                            // 파일 형식으로 사용자에게 반환
                            interaction.editReply({
                                content: channel.name + ' 채널을 백업했어요!',
                                files: [attachment],
                                ephemeral: true,
                            });
                        })
                        .catch((error) => {
                            console.error(error.message);
                            interaction.editReply({
                                content: '채널을 백업하다가 넘어졌어요ㅠㅠ',
                                ephemeral: true,
                            });
                        });
                    break;
                case 'forum_restore':
                    // 포럼복원 관련 코드 작성
                    interaction.editReply({
                        content: '아직 제작중인 기능이에요!',
                        ephemeral: true,
                    });
                    break;
                case 'restore':
                    // 복원 관련 코드 작성
                    interaction.editReply({
                        content: '아직 제작중인 기능이에요!',
                        ephemeral: true,
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error.message)
        }
    },
}



// 모든 메시지 찾기
async function fetchAllMessages(channel) {
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
        }

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) {
            break;
        }

        allMessages = allMessages.concat(Array.from(messages.values()));
        lastId = messages.last().id;
    }

    return allMessages;
}
