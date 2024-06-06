const { Connectors, Shoukaku } = require('shoukaku');
const Discord = require('discord.js');
const{ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const twentyFourSevenSchema = require('../database/schemas/247');

class ShoukakuClient extends Shoukaku {
    constructor(client) {
        super(new Connectors.DiscordJS(client), client.config.nodes, {
            moveOnDisconnect: true,
            resume: false,
            // resumeByLibrary: true,
            reconnectInterval: 50,
            reconnectTries: 5,
            restTimeout: 10000,
            userAgent: "iiitPSoc"
        });

        this.client = client;

        this.on('ready', (name, resumed) =>
            this.client.shoukaku.emit(resumed ? 'nodeReconnect' : 'nodeConnect', this.client.shoukaku.getNode(name))
        );

        this.on('nodeReconnect', (name) => console.log(`Node ${name} is reconnecting!(main)`));
        this.on('nodeError', (name, error) => console.log(`Node ${name} encountered an error!`, error));


        //this.on('ready', (name, resumed) => console.log(`Node ${name} is ready!(main)`));
        this.on('nodeConnect', async (node) => {
        console.log(`Node ${node.name} is ready!(shoukaku line 25)`)
        try {
        
            const data = await twentyFourSevenSchema.find();
    
            if (!data || data.length === 0) {
                console.log('No data found for initialization.');
                return;
            }
            

            setInterval(async() => {
                for (const main of data) {
                    const guild = client.guilds.cache.get(main.guildId);
                    const channel = guild?.channels.cache.get(main.msgChannelId);
                    const vc = guild?.channels.cache.get(main.vcID);
        
                    if (!guild || !channel || !vc) {
                        console.log(`Skipping initialization for invalid data: ${JSON.stringify(main)}`);
                        continue;
                    }
        
                    
                    if(main.isEnabled) await client.queue.create(guild, vc, channel);
        
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }       
            }, 1000*60*30);


            console.log('Initialization completed.');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    });
        // handling voiceStateUpdate
        this.on('voiceStateUpdate', async (oldState, newState) => {
            const guildId = newState.guild.id;
            if (!guildId)
                return;
            const player = this.client.queue.get(guildId);
            if (!player)
                return;
            if (newState.guild.members.cache.get(this.client.user.id) &&
                !newState.guild.members.cache.get(this.client.user.id).voice.channelId) {
                if (player) {
                    return player.destroy();
                }
            }
            if (newState.id === this.client.user.id &&
                newState.channelId &&
                newState.channel.type == ChannelType.GuildStageVoice &&
                newState.guild.members.me.voice.suppress) {
                if (newState.guild.members.me.permissions.has(['Connect', 'Speak']) ||
                    newState.channel.permissionsFor(newState.guild.members.me).has('MuteMembers')) {
                    await newState.guild.members.me.voice.setSuppressed(false).catch(() => { });
                }
            }
            if (newState.id == this.client.user.id)
                return;
            const vc = newState.guild.channels.cache.get(player.player.connection.channelId);
            if (newState.id === this.client.user.id &&
                !newState.serverDeaf &&
                vc &&
                vc.permissionsFor(newState.guild.member.me).has('DeafenMembers'))
                await newState.setDeaf(true);
            if (newState.id === this.client.user.id && newState.serverMute && !player.paused)
                player.pause();
            if (newState.id === this.client.user.id && !newState.serverMute && player.paused)
                player.pause();
            let voiceChannel = newState.guild.channels.cache.get(player.player.connection.channelId);
            if (newState.id === this.client.user.id && newState.channelId === null)
                return;
            if (!voiceChannel)
                return;
            if (voiceChannel.members.filter((x) => !x.user.bot).size <= 0) {
                const server = await this.client.prisma.stay.findFirst({
                    where: { guildId: newState.guild.id },
                });
                if (!server) {
                    setTimeout(async () => {
                        const playerVoiceChannel = newState.guild.channels.cache.get(player.player.connection.channelId);
                        if (player &&
                            playerVoiceChannel &&
                            playerVoiceChannel.members.filter((x) => !x.user.bot).size <= 0) {
                            if (player) {
                                player.destroy();
                            }
                        }
                    }, 5000);
                } else {
                    if (server)
                        return;
                    setTimeout(async () => {
                        const playerVoiceChannel = newState.guild.channels.cache.get(player.player.connection.channelId);
                        if (player &&
                            playerVoiceChannel &&
                            playerVoiceChannel.members.filter((x) => !x.user.bot).size <= 0) {
                            if (player) {
                                player.destroy();
                            }
                        }
                    }, 5000);
                }
            }
        });

        //handling trackStart
        this.on('trackStart', async (player, track, dispatcher) => {
            const guild = client.guilds.cache.get(player.connection.guildId);
            if (!guild)
                return;
            const channel = guild.channels.cache.get(dispatcher.channelId);
            if (!channel)
                return;
                function buttonBuilder() {
                  const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setEmoji('⏪')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(dispatcher.previous ? false : true);
                
                  const resumeButton = new ButtonBuilder()
                    .setCustomId('resume')
                    .setEmoji(player.paused ? '▶️' : '⏸️')
                    .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary);
                  const stopButton = new ButtonBuilder()
                    .setCustomId('stop')
                    .setEmoji('⏹️')
                    .setStyle(ButtonStyle.Danger);
                  const skipButton = new ButtonBuilder()
                    .setCustomId('skip')
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Secondary);
                
                  const loopButton = new ButtonBuilder()
                    .setCustomId('loop')
                    .setEmoji(dispatcher.loop === 'repeat' ? '🔂' : '🔁')
                    .setStyle(dispatcher.loop !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary);
                
                  const volupButton = new ButtonBuilder()
                    .setCustomId('volup')
                    .setEmoji('🔊')
                    .setStyle(ButtonStyle.Secondary);
                
                  const voldownButton = new ButtonBuilder()
                    .setCustomId('voldown')
                    .setEmoji('🔉')
                    .setStyle(ButtonStyle.Secondary);
          
                  const autoplayButton = new ButtonBuilder()
                    .setCustomId('autoplay')
                    .setEmoji('🎶')
                    .setStyle(dispatcher.autoplay ? ButtonStyle.Success : ButtonStyle.Secondary);
                
                  const row1 = new ActionRowBuilder().addComponents(previousButton, resumeButton,skipButton);
                  const row2 = new ActionRowBuilder().addComponents(loopButton, volupButton, autoplayButton, voldownButton,stopButton);
                
                  return [row1, row2];
                }
                
            const embed = new Discord.EmbedBuilder()
                .setAuthor({
                name: 'Now Playing',
                iconURL:
                    client.user.displayAvatarURL({ extension: 'png' }),
            })
                .setColor("Aqua")
                .setDescription(`**[${track.info.title}](${track.info.uri})**`)
                .setFooter({
                text: `Requested by ${track.info.requester.tag}`,
                iconURL: track.info.requester.avatarURL({}),
            })
                .setThumbnail(track.info.thumbnail)
                .addFields({
                name: 'Duration',
                value: track.info.isStream
                    ? 'LIVE'
                    : formatTime(track.info.length),
                inline: true,
            }, { name: 'Author', value: track.info.author, inline: true })
                .setTimestamp();
          
                const message = await channel.send({
                  embeds: [embed],
                  components: buttonBuilder().flat(),
                });
                
                dispatcher.nowPlayingMessage = message;
                const collector = message.createMessageComponentCollector({
                    filter: async (b) => {
                        if (b.guild.members.me.voice.channel &&
                            b.guild.members.me.voice.channelId === b.member.voice.channelId)
                            return true;
                        else {
                            b.reply({
                                content: `You are not connected to <#${b.guild.members.me.voice?.channelId ?? 'None'}> to use this buttons.`,
                                ephemeral: true,
                            });
                            return false;
                        }
                    },
                    //time: track.info.isStream ? 86400000 : track.info.length,
                });
                collector.on('collect', async (interaction) => {
          
                    switch (interaction.customId) {
                        case 'previous':
                            if (!dispatcher.previous) {
                                await interaction.reply({
                                    content: `There is no previous song.`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            else
                                dispatcher.previousTrack();
                            if (message)
                                await message.edit({
                                    embeds: [
                                        embed.setFooter({
                                            text: `Previous by ${interaction.user.tag}`,
                                            iconURL: interaction.user.avatarURL({}),
                                        }),
                                    ],
                                    components: [buttonBuilder()],
                                });
                            break;
                        case 'resume':
                            dispatcher.pause();
                            if (message)
                                await message.edit({
                                    embeds: [
                                        embed.setFooter({
                                            text: `${player.paused ? 'Paused' : 'Resumed'} by ${interaction.user.tag}`,
                                            iconURL: interaction.user.avatarURL({}),
                                        }),
                                    ],
                                    components: [buttonBuilder()],
                                });
                            break;
                        case 'volup':
                            if (player.filters.volume >= 5)
                                return interaction.reply({
                                    content: `Volume is already at the maximum.`,
                                    ephemeral: true,
                                });
                            player.setVolume(player.filters.volume + 40/100);
                            
                            break;
                        case 'voldown':
                            if (player.filters.volume <= 0)
                                return interaction.reply({
                                    content: `Volume is already at the minimum.`,
                                    ephemeral: true,
                                });
                            player.setVolume(player.filters.volume - 40/100);
                            
                            break;
                        case 'skip':
                            if (!dispatcher.queue.length) {
                                await interaction.reply({
                                    content: `There is no more song in the queue.`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            dispatcher.skip();
                            if (message)
                                await message.edit({
                                    embeds: [
                                        embed.setFooter({
                                            text: `Skipped by ${interaction.user.tag}`,
                                            iconURL: interaction.user.avatarURL({}),
                                        }),
                                    ],
                                    components: [],
                                });
                            break;
                        case 'loop':
                            switch (dispatcher.loop) {
                                case 'off':
                                    dispatcher.loop = 'repeat';
                                    if (message)
                                        await message.edit({
                                            embeds: [
                                                embed.setFooter({
                                                    text: `Looping by ${interaction.user.tag}`,
                                                    iconURL: interaction.user.avatarURL({}),
                                                }),
                                            ],
                                            components: [buttonBuilder()],
                                        });
                                    break;
                                case 'repeat':
                                    dispatcher.loop = 'queue';
                                    if (message)
                                        await message.edit({
                                            embeds: [
                                                embed.setFooter({
                                                    text: `Looping Queue by ${interaction.user.tag}`,
                                                    iconURL: interaction.user.avatarURL({}),
                                                }),
                                            ],
                                            components: [buttonBuilder()],
                                        });
                                    break;
                                case 'queue':
                                    dispatcher.loop = 'off';
                                    if (message)
                                        await message.edit({
                                            embeds: [
                                                embed.setFooter({
                                                    text: `Looping Off by ${interaction.user.tag}`,
                                                    iconURL: interaction.user.avatarURL({}),
                                                }),
                                            ],
                                            components: [buttonBuilder()],
                                        });
                                    break;
                            }
                            break;
                        case 'autoplay':
                            player.autoplay = !player.autoplay;
                            if (message)
                                await message.edit({
                                    embeds: [
                                        embed.setFooter({
                                            text: `${player.autoplay ? 'Enabled' : 'Disabled'} Autoplay by ${interaction.user.tag}`,
                                            iconURL: interaction.user.avatarURL({}),
                                        }),
                                    ],
                                    components: [buttonBuilder()],
                                });
                            break;
                          case 'stop':
                            dispatcher.stop();
                            if (message)
                                await message.edit({
                                    embeds: [
                                        embed.setFooter({
                                            text: `Stopped by ${interaction.user.tag}`,
                                            iconURL: interaction.user.avatarURL({}),
                                        }),
                                    ],
                                    components: [],
                                });
                            break;
                    }
                    await interaction.deferUpdate();
                });
          })

        //handling trackEnd
        this.on('trackEnd', async (player, track, reason) => {
            const dispatcher = client.queue.get(player.guildId);
            if (!dispatcher) return;
          
            const m = await dispatcher.nowPlayingMessage?.fetch().catch(() => { });
            const guild = client.guilds.cache.get(player.connection.guildId);
            if (!guild) return;
          
            const channel = guild.channels.cache.get(player.connection.channelId);
            if (!channel) return;
          
            if (dispatcher.loop === 'repeat') dispatcher.queue.unshift(track);
            if (dispatcher.loop === 'queue') dispatcher.queue.push(track);
          
            if (dispatcher.autoplay) {
              await dispatcher.Autoplay(track);
            } else {
              dispatcher.autoplay = false;
            }
          
            if (dispatcher.loop === 'off') {
              dispatcher.previous = dispatcher.current;
              dispatcher.current = null;
            }
          
            if (m && m.deletable) await m.delete().catch(() => { });
          });

        //handling trackStuck
        this.on('trackStuck', async (player, track, thresholdMs) => {
            const guild = client.guilds.cache.get(player.connection.guildId);
            if (!guild) return;
            const channel = guild.channels.cache.get(player.connection.channelId);
            if (!channel) return;
            const dispatcher = client.queue.get(player.guildId);
            if (!dispatcher) return;
            const m = await dispatcher.nowPlayingMessage?.fetch().catch(() => { });
            if (m && m.deletable) await m.delete().catch(() => { });
            dispatcher.stop();
            channel.send(`The player has been stopped because it's stuck for ${thresholdMs}ms.`);
        });

        //handling queueEnd
        this.on('queueEnd', async (player, track, dispatcher) => {
            const guild = client.guilds.cache.get(dispatcher.guildId);
              if (!guild) return;
          
              if (dispatcher.loop === 'repeat') dispatcher.queue.unshift(track);
              if (dispatcher.loop === 'queue') dispatcher.queue.push(track);
          
              if (dispatcher.autoplay) {
                  await dispatcher.Autoplay(track);
              } else {
                  dispatcher.autoplay = false;
              }
          
              if (dispatcher.loop === 'off') {
                  dispatcher.previous = dispatcher.current;
                  dispatcher.current = null;
              }
          })

        this.on('playerMove', (players) => {
            for (const player of players.values()) {
                if (player.voiceChannel) {
                    player.voiceChannel.leave();
                    player.voiceChannel = null;
                }
            }
        })
       this.on('playerDestroy', (player) => {
            const guild = client.guilds.cache.get(player.connection.guildId);
                  if (!guild) return;
          })

        this.on('error', (name, error) => this.client.shoukaku.emit('nodeError', name, error));
        this.on('close', (name, code, reason) => this.client.shoukaku.emit('nodeDestroy', name, code, reason));
        this.on('disconnect', (name, players, moved) => {
            if (moved) this.emit('playerMove', players);
            this.client.shoukaku.emit('nodeDisconnect', name, players);
        });

        this.on('debug', (name, reason) => this.client.shoukaku.emit('nodeRaw', name, reason));
        //this.on("debug", (name, reason) => console.log(`[WS => ${name}] ${reason || "No reason"}`));
    }
}

module.exports = ShoukakuClient;

function formatTime(ms) {
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
        throw new Error('Invalid input. Please provide a non-negative number of seconds.');
    }
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;
    if (ms < minuteMs) {
        return `${ms / 1000}s`;
    }
    else if (ms < hourMs) {
        return `${Math.floor(ms / minuteMs)}m ${Math.floor((ms % minuteMs) / 1000)}s`;
    }
    else if (ms < dayMs) {
        return `${Math.floor(ms / hourMs)}h ${Math.floor((ms % hourMs) / minuteMs)}m`;
    }
    else {
        return `${Math.floor(ms / dayMs)}d ${Math.floor((ms % dayMs) / hourMs)}h`;
    }
}