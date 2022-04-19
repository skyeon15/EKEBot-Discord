const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('핑')
        .setDescription('핑 하면 퐁 해요!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '핑퐁 중...', fetchReply: true });
        interaction.editReply(`퐁! 지연시간 : ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};