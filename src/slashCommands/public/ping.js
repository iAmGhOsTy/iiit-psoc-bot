module.exports = {
    name: 'ping',
    description: 'ping command which returns the bot\'s latency',
    usage: '<prefix>ping', //OPTIONAL (for the help cmd)
    examples: ['example', 'example ping:true'], //OPTIONAL (for the help cmd)
    category: "public",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [], // OPTIONAL
    
    
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });
        interaction.editReply(`Pong! ${client.ws.ping}ms`)
    }
}