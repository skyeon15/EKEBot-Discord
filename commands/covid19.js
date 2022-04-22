const { SlashCommandBuilder } = require('@discordjs/builders');
const https = require('https');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('코로나')
		.setDescription('대한민국 코로나19 상황을 알려줘요.'),
	async execute(interaction) {
		function dot(todot, compare = false) {
			var check = Math.sign(todot)
			if (check == -1 && compare) {
				return todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
			} else if (compare) {
				return '+' + todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
			}
			return todot.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
		}

		var data = ''
		https.request({
			method: 'GET',
			host: 'api.bbforest.net',
			path: '/covid19',
		  }, function (ress) {
			ress.on('data', function (chunk) {
			  data += chunk
			})
			ress.on('end', function () {
				data = JSON.parse(data)
				const Embed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('대한민국 코로나19 상황')
					.setDescription('실시간 국내 코로나19 상황이에요.\n전일대비 수치는 가장 최근 발표에요.')
					.addField('실시간', `${dot(data.live)}명`)
					.addField('직전 발표자료', `누적 확진자 : ${dot(data.confirmed[0])}(${dot(data.confirmed[1], true)})
												위중증 : ${dot(data.critical[0])}(${dot(data.critical[1], true)})
												신규입원 : ${dot(data.hospital[0])}(${dot(data.hospital[1], true)})
												사망자 : ${dot(data.deceased[0])}(${dot(data.deceased[1], true)})`)
					.addField('백신 접종 현황', `1차 ${dot(data.vac1[0])}(${dot(data.vac1[1], true)})
												2차 ${dot(data.vac2[0])}(${dot(data.vac2[1], true)})
												3차 ${dot(data.vac3[0])}(${dot(data.vac3[1], true)})`)
					.setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

				interaction.channel.send({ embeds: [Embed] });
			})
		}).end()
	},
};