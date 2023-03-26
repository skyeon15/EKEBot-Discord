const { api } = require('../config.json');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  organization: api.openaiOrganization,
  apiKey: api.openaiApi,
});
const openai = new OpenAIApi(configuration);

module.exports = {
    async interaction(interaction) {
        try {
            await interaction.deferReply() // 답변 대기

            await interaction.editReply(await GetMessage(interaction.options.getString('message'))) // 답변 전송
        } catch (error) {
            console.log(error)
            interaction.followUp({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    },
    async message(message){
        try {
            await message.reply(await GetMessage(message.content)) // 답변 전송
        } catch (error) {
            console.log(error)
            message.reply({ content: '오류가 발생했어요. 다시 시도해주세요.', ephemeral: true }) // 새로운 응답 전송
        }
    }
};

async function GetMessage(message) {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message },
        { role: "system", content: "Your name is 에케봇, and your answer should be a short sentence in Korean, with a friendly agent tone." }],
        // 너의 이름은 에케봇이야. 답변은 한글로 짧게 한 문장으로 해야해. 친절한 상담원 말투로 대답해줘.
    }).then(res => {
        return res.data.choices[0].message.content
    }).catch(error => {
        console.log(error)
    })

    return res
}