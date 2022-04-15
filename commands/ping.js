module.exports={
    name:'핑',
    description: "핑 하면 퐁 해요!",
    execute(message){
        return message.channel.send(`퐁!`)
    }
}