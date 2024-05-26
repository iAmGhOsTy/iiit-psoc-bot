module.exports = async (client, guild) => {

 client.logger.info(`Joined a new guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

}