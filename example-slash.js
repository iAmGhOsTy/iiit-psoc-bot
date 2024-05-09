module.exports = {
    name: 'ping',
    description: 'Very simple example of a command to understand how to use this template',
    usage: '<prefix>example [ping]', //OPTIONAL (for the help cmd)
    examples: ['example', 'example ping:true'], //OPTIONAL (for the help cmd)
    category: "public",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [], // OPTIONAL
    // options: [
    //     {
    //         name: 'ping',
    //         description: "Get the bot's latency",
    //         type: 3, required: false,
    //         choices: [ { name: "yes", value: 'true' }, { name: "no", value: 'false' } ]
    //     }
    // ], // OPTIONAL, (/) command options ; read https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
    
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });
        interaction.editReply(`Pong! ${client.ws.ping}ms`)
    }
}