const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, Channel, Interaction } = require('discord.js');
const axios = require('axios');
const client = require('../client');
const { err } = require('../modules/translate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('채널백업')
        .setDescription('채널을 백업하거나 복원해요.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('실행할 작업을 선택해요.')
                .setRequired(true)
                .addChoices([
                    ['백업', 'backup'],
                    ['포럼복원', 'forum_restore'],
                    ['복원', 'restore'],
                    ['포럼복사', 'forum_copy']
                ]))
        .addStringOption(option =>
            option.setName('channel_id')
                .setDescription('채널 ID를 입력해요.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('json_url')
                .setDescription('JSON URL을 입력해요. 포럼 복사시에는 포럼 ID를 입력하세요.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('tag_id')
                .setDescription('태그 ID를 입력하세요')
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

        if (channel == undefined) {
            // 채널 ID가 비어있으면
            channel = interaction.channel
        } else {
            // 채널 ID로 채널 찾기
            channel = await client.channels.fetch(channel)
                .then((channel) => {
                    return channel
                }).catch((error) => {
                    console.log(error.stack)
                    return interaction.editReply('존재하지 않는 채널이에요.')
                })
        }

        try {
            switch (action) {
                case 'backup':
                    // 백업시 모든 메시지 가져오기
                    interaction.editReply({
                        content: channel.name + ' 채널을 백업했어요!',
                        files: [await jsonToFile(await fetchAllMessages(channel))
                            .catch((error) => {
                                throw new Error(error)
                            })],
                        ephemeral: true,
                    })
                    break;
                case 'forum_restore':
                    // 포럼 복원 URL로 JSON을 받아오기
                    axios.get(interaction.options.getString('json_url'))
                        .then((response) => {
                            // 포럼 복원 함수
                            forum_restore(response.data, channel, interaction)
                        }).catch((error) => {
                            console.log(error.stack)
                            interaction.editReply('JSON URL에 접근할 수 없어요.')
                        })
                    break;
                case 'forum_copy':
                    // 포럼 복사
                    forum_restore(await fetchAllMessages(channel), await client.channels.fetch(interaction.options.getString('json_url')), interaction)
                    break;
                case 'restore':
                    // 복원
                    interaction.editReply({
                        content: '아직 제작중인 기능이에요!',
                        ephemeral: true,
                    });
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error.stack)
            interaction.editReply('알 수 없는 오류가 발생했어요.')
        }
    },
}

/**
 * 게시글 포럼 복원 함수
 *
 * @param {json} jsonData 백업한 JSON
 * @param {Channel} forum 복원할 포럼 채널
 * @param {Interaction} interaction 메시지 전송을 위한 인터렉션
 * @returns attachment 첨부파일
 */
async function forum_restore(jsonData, forum, interaction) {
    try {
        let tag_id = interaction.options.getString('tag_id')

        if (tag_id == null) {
            return interaction.editReply('태그 ID가 없어요. 포스트를 작성하려면 꼭 있어야 해요.')
        }

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
                            const response = await axios.get(content)
                                .catch((error) => {
                                    console.log(error.stack)
                                })
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
                        content: content.replace(/<[^>]*>/g, '') + '.',
                        files: fileUrls
                    },
                    appliedTags: [tag_id]
                };

                forum.threads.create(newItem)
                    .catch((error) => {
                        console.log(error.stack)
                    })

                result.push(newItem);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        await interaction.editReply(`전체 ${result.length}개 업로드를 요청했어요!`)
    } catch (error) {
        console.log('[forum_restore]\n' + error.stack)
        interaction.editReply('포스트를 작성하다 펜이 부러졌어요.ㅠㅠ')
    }
}

/**
 * JSON 데이터를 파일로 반환
 *
 * @param {json} jsonData 백업한 JSON
 * @returns 디스코드 첨부파일 형식
 */
async function jsonToFile(jsonData) {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    const attachment = new MessageAttachment(buffer, 'backup_data.json');

    // 파일 형식 반환
    return attachment
}

/**
 * 채팅 채널의 모든 메시지 불러오기
 *
 * @param {Channel} channel 불러올 채팅 채널
 * @returns {json} 모든 메시지 데이터
 */
async function fetchAllMessages(channel) {
    try {
        let allMessages = []
        let lastId

        while (true) {
            const options = { limit: 100 }
            if (lastId) {
                options.before = lastId
            }

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) {
                break
            }

            allMessages = allMessages.concat(Array.from(messages.values()));
            lastId = messages.last().id
        }

        const messagesJson = allMessages.map((message) => {
            // 첨부 파일 처리
            const attachments = message.attachments.map((attachment) => {
                return {
                    id: attachment.id,
                    url: attachment.url,
                }
            })

            return {
                id: message.id,
                content: message.content,
                author: {
                    id: message.author.id,
                    username: message.author.username + '#' + message.author.discriminator,
                },
                timestamp: message.createdTimestamp,
                attachments: attachments, // 첨부 파일 정보 추가
            }
        })

        return messagesJson
    }
    catch (error) {
        console.log('[fetchAllMessages]' + error.stack)
    }
}
