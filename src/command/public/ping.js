module.exports = {
    name: 'ping',
    description: 'ping command which returns the bot\'s latency',
    usage: '<prefix>ping', //OPTIONAL (for the help cmd)
    examples: ['+ping'], //OPTIONAL (for the help cmd)
    aliases: ['pong'],
    category: "public",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [], // OPTIONAL
    
    run :async (client, message, args) => {   
        message.reply(`${client.ws.ping}ms`)
    }
}