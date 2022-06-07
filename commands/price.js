const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const { MessageEmbed } = require('discord.js');

function dot(todot, compare = false) {
    var check = Math.sign(todot)
    if (check == -1 && compare) {
        return todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    } else if (compare) {
        return '+' + todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    }
    return todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('시세')
        .setDescription('각종 시세를 알려줘요.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('원하는 현물을 선택해주세요.')
                .addChoices([['금', 'gold'], ['기름', 'oil']])
                .setRequired(true)
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
                        return
                    })
                break;
            default:
                break;
        }
    },
};