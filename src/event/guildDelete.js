module.exports = async (client, guild) => {
    client.logger.info(`Left a guild: ${guild.name} (id: ${guild.id}). This guild had ${guild.memberCount} members!`);
}