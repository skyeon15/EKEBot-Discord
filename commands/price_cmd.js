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
        .setName('시세')
        .setDescription('각종 시세를 알려줘요.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('원하는 현물을 선택해주세요.')
                .addChoices([['금', 'gold'], ['기름', 'oil'], ['코인', 'coin']])
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('coin_sym')
                .setDescription('코인 심볼')
        ),

    async execute(interaction) {
        switch (interaction.options.getString('name')) {
            case 'gold':
                axios.get('https://api.odcloud.kr/api/GetGeneralProductInfoService/v1/getGoldPriceInfo?serviceKey=bG6kzLZ7ZbDdEqY8Fh7oUZVP9Agt6ly6ZDHHMrbXEWedZU0EvRdApev%2FcQZU2z3YeiYhyJD1VxOyg%2ByLKFCc%2Fg%3D%3D&resultType=json&numOfRows=2')
                    .then(function (res) {
                        var data = res.data.response.body.items.item
                        const Embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('금 시세')
                            .setDescription(`${data[0].basDt.substring(6)}일 기준 금 시세에요!`)
                            .addField(data[0].itmsNm, `${dot(data[0].mkp)}원
                                                        최고가 : ${dot(data[0].hipr)}
                                                        최저가 : ${dot(data[0].lopr)}`)
                            .addField(data[1].itmsNm, `${dot(data[1].mkp)}원
                                                        최고가 : ${dot(data[1].hipr)}
                                                        최저가 : ${dot(data[1].lopr)}`)
                            .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

                        interaction.reply({ embeds: [Embed] });
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
                break;
            case 'oil':
                axios.get('https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getOilPriceInfo?serviceKey=bG6kzLZ7ZbDdEqY8Fh7oUZVP9Agt6ly6ZDHHMrbXEWedZU0EvRdApev%2FcQZU2z3YeiYhyJD1VxOyg%2ByLKFCc%2Fg%3D%3D&resultType=json&numOfRows=3')
                    .then(function (res) {
                        var data = res.data.response.body.items.item;
                        const Embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('유가 정보')
                            .setDescription(`${data[0].basDt.substring(6)}일 기준 유가 정보에요!`)
                            .addField(data[0].oilCtg, `
                            평균가격 : ${dot(data[0].wtAvgPrcCptn)}원
                            가중평균가격 : ${dot(data[0].wtAvgPrcDisc)}원
                            거래량 : ${dot(data[0].trqu)}L
                            거래금액 : ${dot(data[0].trPrc)}원
                          `)
                            .addField(data[1].oilCtg, `
                            평균가격 : ${dot(data[1].wtAvgPrcCptn)}원
                            가중평균가격 : ${dot(data[1].wtAvgPrcDisc)}원
                            거래량 : ${dot(data[1].trqu)}L
                            거래금액 : ${dot(data[1].trPrc)}원
                          `)
                            .addField(data[2].oilCtg, `
                            평균가격 : ${dot(data[2].wtAvgPrcCptn)}원
                            가중평균가격 : ${dot(data[2].wtAvgPrcDisc)}원
                            거래량 : ${dot(data[2].trqu)}L
                            거래금액 : ${dot(data[2].trPrc)}원
                        `)
                            .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

                        interaction.reply({ embeds: [Embed] });
                    })
                    .catch(function (error) {
                        console.log(error)
                    });

                break;
            case 'coin':
                var coin_sym = interaction.options.getString('coin_sym').toUpperCase();
                axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${coin_sym}&CMC_PRO_API_KEY=${api.coinmarketcap}`)
                    .then(response => {
                        const data = response.data.data[coin_sym].quote.USD
                        const Embed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(coin_sym + ' 정보')
                            .setDescription(`현재 ${coin_sym} 거래정보에요.`)
                            .addField('시세', `
                        현재가 : $${dot(data.price)}`)
                            .addField('거래량', `
                        $${dot(data.volume_24h)}
                        전일대비 ${data.volume_change_24h}`)
                            .addField('등락률', `
                        1시간 : ${dot(data.percent_change_1h)}%
                        24시간 : ${dot(data.percent_change_24h)}%
                        7일 : ${dot(data.percent_change_7d)}%
                        30일 : ${dot(data.percent_change_30d)}%`)
                            .addField('기준', `
                        ${moment(data.last_updated).format('YYYY-MM-DD hh:mm')}`)
                            .setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

                        interaction.reply({ embeds: [Embed] });
                    })
                    .catch(error => {
                        console.log(error);
                    });
                break;
            default:
                break;
        }
    },
};