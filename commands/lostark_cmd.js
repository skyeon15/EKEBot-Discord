const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { api } = require('../config.json');

function dot(number) {
    const parts = parseFloat(number).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('로스트아크')
        .setDescription('로스트아크 캐릭터 정보를 알려줘요.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('닉네임을 알려줄래요?')
                .setRequired(true)
        ),

    async execute(interaction) {

        axios.get('https://api.bbforest.net/lostark?nickname=' + encodeURI(interaction.options.getString('name')))
            .then(function (res) {
                var data = res.data
                const Embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${data.name}님의 로스트아크`)
                    .setDescription(`로스트아크 캐릭터 정보에요!`)
                    .addFields(
                        { name: '레벨', value: 'Lv.' + data.level, inline: true },
                        { name: '서버', value: data.server, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                        { name: 'PVP', value: data.pvp, inline: true },
                        { name: '칭호', value: data.title, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                        { name: '길드', value: data.guild, inline: true },
                        { name: '영지', value: `${data.wisdom}`, inline: true },
                        { name: '영지 레벨', value: 'Lv.' + data.wisdom_level, inline: true }, // 빈 필드
                        { name: '원정대 레벨', value: 'Lv.' + data.lever_expedition, inline: true },
                        { name: '전투 레벨', value: 'Lv.' + data.level_fight, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                        { name: '장착 아이템', value: 'Lv.' + data.level_item, inline: true },
                        { name: '달성 아이템', value: 'Lv.' + data.level_item2, inline: true },
                        { name: '\u200B', value: '\u200B', inline: true }, // 빈 필드
                    )
                    .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' })

                interaction.reply({ embeds: [Embed] })
            })
            .catch(function (error) {
                console.log(error)
                const Embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${interaction.options.getString('name')}님의 로스트아크`)
                    .setDescription(`아크라시아에서 해당 이용자를 찾지 못 했어요.`)
                    .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' })
                interaction.reply({ embeds: [Embed] })
            })
    }
}