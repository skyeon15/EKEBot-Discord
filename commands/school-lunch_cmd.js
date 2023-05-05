const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { default: axios } = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('급식')
		.setDescription('학교 급식을 알려줘요.')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('학교 이름을 입력하세요.')
				.setRequired(true)
		),
	async execute(interaction) {
		axios.get(encodeURI('https://api.bbforest.net/school-lunch/' + interaction.options.getString('name')))
			.then((res) => {
				var data = res.data
				const Embed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle(data.NAME + ' 급식')
					.setDescription('오늘의 급식이에요!')
					.setFooter({ text: '에케봇 By.파란대나무숲', iconURL: 'https://i.imgur.com/fWGVv2K.png' });

				try {
					for (var meal of data.MEALS) {
						Embed
							.addField(meal.meal, meal.dish.replace(/<br\/>/g, '\n'))
					}
					interaction.reply({ embeds: [Embed] });
				} catch (error) {
					console.log(error.message)
					interaction.reply({ content: '급식을 찾을 수 없어요. 다시 시도해보세요!', fetchReply: true })
				}
			})
			.catch((err) => {
				console.log(error.message)
				interaction.reply({ content: '급식을 찾을 수 없어요. 다시 시도해보세요!', fetchReply: true })
			})
	}
}