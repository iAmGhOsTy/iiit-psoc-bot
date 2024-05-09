const { ActivityType } = require('discord.js');
module.exports = async (client) => {
    client.logger.info(`[!] ${client.user.username} is now started...`)
    client.logger.info(`[!] The bot has ${client.commands.size} commands and ${client.slashCommands.size} (/) commands`)
    client.user.setActivity(`Students Code.`, { type: ActivityType.Watching })
};
