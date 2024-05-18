const StickyMessage = require('../../database/schemas/stickyMessage');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'stick',
    description: 'Makes a message sticky',
    usage: '<prefix>stick <message link>',
    examples: ['stick https://discord.com/channels/123478/12345678978/1278'],
    aliases: ['pin'],
    category: 'private',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageGuild],

    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply('Please provide a message link.');
        }

        const messageLink = args[0];
        const match = messageLink.match(/https:\/\/discord.com\/channels\/(\d+)\/(\d+)\/(\d+)/);

        if (!match) {
            return message.reply('Invalid message link.');
        }

        const [, guildId, channelId, messageId] = match;

        try {
            const channel = await client.channels.fetch(channelId);
            const msg = await channel.messages.fetch(messageId);

            const newMessage = await channel.send(msg.content);

            
            const stickyMessage = new StickyMessage({
                guildId,
                channelId,
                messageId,
                content: msg.content,
                lastStickyMessageId: newMessage.id
            });
            await stickyMessage.save();

            message.reply('Message marked as sticky successfully.');
        } catch (error) {
            console.error(error);
            message.reply('Failed to mark the message as sticky. Make sure the link is correct and I have the necessary permissions.');
        }
    }
};
