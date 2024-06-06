const { EmbedBuilder,Colors } = require('discord.js');
module.exports = {
    name: 'join',
    description: 'The bot joins the vc',
    usage: '<prefix>[join]', //OPTIONAL (for the help cmd)
    examples: ['example', 'example join'], //OPTIONAL (for the help cmd)
    aliases: ['j'],
    category: "music",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [], // OPTIONAL
    
    run :async (client, message, args) => {   
        try {

            let player = client.queue.get(message.guild.id);
            if (!player) {
                const init = message.member;
                player = await client.queue.create(message.guild, init.voice.channel, message.channel, client.shoukaku.getNode());
                return await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setDescription(`Joined <#${player.player.connection.channelId}>`),
                    ],
                });
            }
            else {
                return await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(`I'm already connected to <#${player.player.connection.channelId}>`),
                    ],
                });
            }

        } catch (e) {
            console.log(e)
        }
    }
}