const { EmbedBuilder,Colors } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'make the bot play music',
    usage: '<prefix>[play]', //OPTIONAL (for the help cmd)
    examples: ['example', 'example play'], //OPTIONAL (for the help cmd)
    aliases: ['p'],
    category: "music",
    cooldown: 1, // Cooldown in seconds, by default it's 2 seconds | OPTIONAL
    permissions: [], // OPTIONAL
    
    run :async (client, message, args) => {   
        try {

            const query = args.join(' ');
            let player = client.queue.get(message.guild.id);
            const vc = message.member;

            if (!player)
            player = await client.queue.create(message.guild, vc.voice.channel, message.channel, client.shoukaku.getNode());
        const res = await client.queue.search(query);
        const embed = new EmbedBuilder();

        switch (res.loadType) {
            case 'LOAD_FAILED':
                message.channel.send({
                    embeds: [
                        embed
                            .setColor(Colors.Red)
                            .setDescription('There was an error while searching.'),
                    ],
                });
                break;
            case 'NO_MATCHES':
                message.channel.send({
                    embeds: [
                        embed
                            .setColor("Aqua")
                            .setDescription('There were no results found.'),
                    ],
                });
                break;
            case 'TRACK_LOADED': {
                const track = player.buildTrack(res.tracks[0], message.author);
                if (player.queue.length > 100)
                    return await message.channel.send({
                        embeds: [
                            embed
                                .setColor(Colors.Red)
                                .setDescription(`The queue is too long. The maximum length is ${client.config.maxQueueSize} songs.`),
                        ],
                    });
                player.queue.push(track);
                await player.isPlaying();
                message.channel.send({
                    embeds: [
                        embed
                            .setColor(Colors.Green)
                            .setDescription(`Added [${res.tracks[0].info.title}](${res.tracks[0].info.uri}) to the queue.`),
                    ],
                });
                break;
            }
            case 'PLAYLIST_LOADED':
                for (const track of res.tracks) {
                    const pl = player.buildTrack(track, interaction.member);
                    player.queue.push(pl);
                }
                await player.isPlaying();
                message.channel.send({
                    embeds: [
                        embed
                            .setColor(Colors.Green)
                            .setDescription(`Added ${res.tracks.length} songs to the queue.`),
                    ],
                });
                break;
            case 'SEARCH_RESULT': {
                const track1 = player.buildTrack(res.tracks[0], message.author);
                player.queue.push(track1);
                await player.isPlaying();
                message.channel.send({
                    embeds: [
                        embed
                            .setColor(Colors.Green)
                            .setDescription(`Added [${res.tracks[0].info.title}](${res.tracks[0].info.uri}) to the queue.`),
                    ],
                });
                break;
            }
        }

        } catch (e) {
            console.log(e)
        }
    }
}