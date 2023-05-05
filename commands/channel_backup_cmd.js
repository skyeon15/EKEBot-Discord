const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const axios = require('axios');
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
                .setRequired(false))
        .addStringOption(option =>
            option.setName('custom')
                .setDescription('기타 옵션을 입력하세요.')
                .setRequired(false)),
    async execute(interaction) {
        // 관리자 권한 확인
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: '관리자 권한이 있는 사람만 사용할 수 있어요.',
                ephemeral: true
            })
        }

        await interaction.deferReply({ ephemeral: true }) // 답변 대기

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
                    let forum = await client.channels.fetch(interaction.options.getString('channel_id'))

                    axios.get(interaction.options.getString('json_url'))
                        .then((response) => {
                            processJson(response.data, forum, interaction)
                        }).catch((error) => {
                            console.log(error.message)
                            interaction.editReply({
                                content: '포럼에 글을 쓰다가 펜이 부서졌어요ㅠㅠ',
                                ephemeral: true,
                            });
                        })
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

async function processJson(jsonData, forum, interaction) {
    const result = [];

    // jsonData의 각 항목에 대해
    for (const item of jsonData) {
        const { content, author, attachments } = item;

        // content가 URL이거나 attachments가 비어있지 않은 경우
        if (content.includes('http') || attachments.length > 0) {
            let web = '';

            if (content) {
                // content가 URL인 경우
                try {
                    if (content.includes('twitter')) {
                        //URL이 twitter면
                        web = '트위터 / '
                    } else {
                        // 메타 태그에서 제목 가져오기
                        const response = await axios.get(content);
                        const titleRegex = /<title>(.*?)<\/title>/i;
                        const titleMatch = response.data.match(titleRegex);
                        web = titleMatch && titleMatch[1] ? titleMatch[1] : '';

                        // " - YouTube" 문자열 제거
                        web = web.replace(' - YouTube', '') + ' / ';
                    }

                } catch (error) {
                    // URL이 처리에 오류가 나면 content 사용
                    web = content;
                }
            }

            // 사용자 이름에서 '#' 앞 부분만 사용
            const username = author.username.split('#')[0];

            // 제목에 URL 제거
            let name = web.replace(/https?:\/\/[^\s]+/g, '') + username

            // 파일 URL 배열 생성
            const fileUrls = attachments.map(attachment => attachment.url);

            // 새 JSON 항목 작성
            const newItem = {
                name: name.replace(/<[^>]*>/g, ''),
                message: {
                    content: content.replace(/<[^>]*>/g, '') + ' .',
                    files: fileUrls
                },
                appliedTags: [interaction.options.getString('custom')]
            };

            forum.threads.create(newItem)
                .then((data) => {
                    // 처리 완료됐을 때 결과 배열에 추가
                }).catch((error) => {
                    console.log(error.message)
                })

            result.push(newItem);
            await new Promise(resolve => setTimeout(resolve, 30));
        }
    }

    // console.log(result);
    await interaction.editReply({
        content: `전체 ${newItem.length}개 업로드를 요청했어요!`,
        ephemeral: true,
    })
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
