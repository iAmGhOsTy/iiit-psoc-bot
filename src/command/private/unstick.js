const StickyMessage = require('../../database/schemas/stickyMessage');
const { PermissionFlagsBits } = require('discord.js');


module.exports = {
    name: 'unstick',
    description: 'Remove the sticky message from the channel',
    usage: '<prefix>unstick',
    category: 'private',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageGuild],

    run: async (client, message, args) => {
        try {
            const stickyMessage = await StickyMessage.findOneAndDelete({ channelId: message.channel.id });

            if (!stickyMessage) {
                return message.reply('There is no sticky message set for this channel.');
            }

            const channel = await client.channels.fetch(stickyMessage.channelId);
            const oldMessage = await channel.messages.fetch(stickyMessage.lastStickyMessageId);
            await oldMessage.delete();

            message.reply('Sticky message removed successfully.');
        } catch (error) {
            console.error('Failed to unstick message:', error);
            message.reply('Failed to remove sticky message. Please try again later.');
        }
    }
};
